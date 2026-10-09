from django.contrib.auth.models import User
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Cart, CartItem, Product, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer, CheckoutSerializer


class AddItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1, default=1)


class UpdateItemSerializer(serializers.Serializer):
    item_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1)


class RemoveItemSerializer(serializers.Serializer):
    item_id = serializers.IntegerField(min_value=1)


def locked_cart(user):
    # Serialize creation and mutations per account, including initially empty carts.
    User.objects.select_for_update().get(pk=user.pk)
    cart, _ = Cart.objects.get_or_create(user=user)
    return Cart.objects.select_for_update().get(pk=cart.pk)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def get_cart(request):
    return Response(CartSerializer(locked_cart(request.user), context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def add_to_cart(request):
    data = AddItemSerializer(data=request.data)
    data.is_valid(raise_exception=True)
    cart = locked_cart(request.user)
    product = get_object_or_404(Product.objects.select_for_update(), pk=data.validated_data['product_id'])
    item = cart.items.filter(product=product).first()
    quantity = (item.quantity if item else 0) + data.validated_data['quantity']
    if quantity > product.stock:
        return Response({'error': 'Not enough stock available.'}, status=400)
    if item:
        item.quantity = quantity
        item.save(update_fields=['quantity'])
    else:
        CartItem.objects.create(cart=cart, product=product, quantity=quantity)
    return Response({'message': 'Product added to cart', 'cart': CartSerializer(cart, context={'request': request}).data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def update_cart_quantity(request):
    data = UpdateItemSerializer(data=request.data)
    data.is_valid(raise_exception=True)
    cart = locked_cart(request.user)
    item = get_object_or_404(CartItem, pk=data.validated_data['item_id'], cart=cart)
    product = Product.objects.select_for_update().get(pk=item.product_id)
    if data.validated_data['quantity'] > product.stock:
        return Response({'error': 'Not enough stock available.'}, status=400)
    item.quantity = data.validated_data['quantity']
    item.save(update_fields=['quantity'])
    return Response(CartItemSerializer(item, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def remove_from_cart(request):
    data = RemoveItemSerializer(data=request.data)
    data.is_valid(raise_exception=True)
    cart = locked_cart(request.user)
    item = get_object_or_404(CartItem, pk=data.validated_data['item_id'], cart=cart)
    item.delete()
    return Response({'message': 'Item removed from cart'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def create_order(request):
    details = CheckoutSerializer(data=request.data)
    details.is_valid(raise_exception=True)
    cart = locked_cart(request.user)
    items = list(cart.items.order_by('product_id'))
    if not items:
        return Response({'error': 'Cart is empty.'}, status=400)
    products = {product.pk: product for product in Product.objects.select_for_update().filter(pk__in=[item.product_id for item in items]).order_by('pk')}
    quantities = {}
    for item in items:
        quantities[item.product_id] = quantities.get(item.product_id, 0) + item.quantity
    for product_id, quantity in quantities.items():
        product = products.get(product_id)
        if product is None or quantity < 1 or quantity > product.stock:
            return Response({'error': 'A product in your bag is no longer available in that quantity. Please update your bag.'}, status=400)
    total = sum(products[item.product_id].price * item.quantity for item in items)
    order = Order.objects.create(user=request.user, total_amount=total, **details.validated_data)
    for item in items:
        product = products[item.product_id]
        OrderItem.objects.create(order=order, product=product, product_name=product.name, quantity=item.quantity, price=product.price)
    for product_id, quantity in quantities.items():
        product = products[product_id]
        product.stock -= quantity
        product.save(update_fields=['stock'])
    cart.items.all().delete()
    return Response({'message': 'Order created successfully', 'order_id': order.pk}, status=201)
