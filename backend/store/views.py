from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail, EmailMessage
from django.db.models import Count, Sum, Value, DecimalField
from django.db.models.functions import Coalesce
from django.conf import settings
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from .serializers import RegisterSerializer, UserSerializer, AdminCustomerSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer, ContactMessageSerializer
from rest_framework import status
from .models import Product, Category, Cart, CartItem, Order, OrderItem, UserProfile
from .serializers import ProductSerializer, CategorySerializer, CartSerializer, CartItemSerializer,OrderItemSerializer,OrderSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from urllib.request import urlopen
import json


def _is_admin(user):
    return user.is_authenticated and (user.is_staff or user.is_superuser)


def _admin_required(request):
    if not _is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    return None


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    user = authenticate(username=request.data.get('username', ''), password=request.data.get('password', ''))
    if not user or not _is_admin(user):
        return Response({'error': 'Invalid admin credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user, context={'request': request}).data,
    })

@api_view(['GET'])
def get_products(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
def get_product(request, pk):
    try:
        product = Product.objects.get(id=pk)
        serializer = ProductSerializer(product, context = {'request': request})
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

@api_view(['GET'])
def get_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_category(request):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        name = request.data.get('name', '').strip()
        if not name:
            return Response({'error': 'Category name is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if category already exists
        if Category.objects.filter(name__iexact=name).exists():
            return Response({'error': 'Category already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create slug from name
        from django.utils.text import slugify
        slug = slugify(name)
        if Category.objects.filter(slug=slug).exists():
            slug = f"{slug}-{Category.objects.count() + 1}"
        
        category = Category.objects.create(name=name, slug=slug)
        serializer = CategorySerializer(category)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_category(request, pk):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        category = Category.objects.get(id=pk)
        # Check if category has products
        if category.products.exists():
            return Response(
                {'error': 'Cannot delete category with products. Delete or reassign products first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        category.delete()
        return Response({'message': 'Category deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except Category.DoesNotExist:
        return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    serializer = CartSerializer(cart)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get('product_id')
    product = Product.objects.get(id=product_id)
    cart, created = Cart.objects.get_or_create(user=request.user)
    item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    if not created:
        item.quantity += 1
        item.save()
    return Response({'message': 'Product added to cart',"cart":CartSerializer(cart).data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_cart_quantity(request):
    item_id = request.data.get('item_id')
    quantity = request.data.get('quantity')
    
    if not item_id or quantity is None:
        return Response({'error': 'Item ID and quantity are required'}, status=400)
    
    try:
        item = CartItem.objects.get(id=item_id)
        if int(quantity) < 1:
            item.delete()
            return Response({'error': 'Quantity must be at least 1'}, status=400)
        
        item.quantity = quantity
        item.save()
        serializer = CartItemSerializer(item)
        return Response(serializer.data)
    except CartItem.DoesNotExist:
        return Response({'error': 'Cart item not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request):
    item_id = request.data.get('item_id')
    CartItem.objects.filter(id=item_id).delete()
    return Response({'message': 'Item removed from cart'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    try:
        data = request.data
        name = data.get('name')
        address = data.get('address')
        phone = data.get('phone')
        payment_method = data.get('payment_method','COD')

        if not phone.isdigit() or len(phone) < 10:
            return Response({'error': 'Invalid phone number'}, status=400)
        
        cart, created = Cart.objects.get_or_create(user=request.user)
        if not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=400)
        
        total = sum([item.product.price * item.quantity for item in cart.items.all()])
        order = Order.objects.create(user=request.user, total_amount=total)

        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )
        cart.items.all().delete()
        return Response({'message': 'Order created successfully', 'order_id': order.id})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

def _verify_google_id_token(id_token):
    try:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
        with urlopen(url, timeout=10) as response:
            data = json.loads(response.read().decode())
    except Exception as e:
        raise ValueError(f"Invalid Google token: {str(e)}")

    if data.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise ValueError("Google token audience mismatch")

    if data.get("email_verified") not in ["true", True, "True"]:
        raise ValueError("Google email not verified")

    return data

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth_view(request):
    id_token = request.data.get('id_token')
    if not id_token:
        return Response({'error': 'id_token is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        data = _verify_google_id_token(id_token)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    email = data.get('email')
    name = data.get('name') or ''
    first_name = data.get('given_name') or name.split(' ')[0] if name else ''
    last_name = data.get('family_name') or ' '.join(name.split(' ')[1:]) if name else ''

    if not email:
        return Response({'error': 'Google token did not provide an email'}, status=status.HTTP_400_BAD_REQUEST)

    user, created = User.objects.get_or_create(email=email, defaults={
        'username': email.split('@')[0][:150],
        'first_name': first_name,
        'last_name': last_name,
    })
    if created:
        user.set_unusable_password()
        user.save()

    # keep profile in sync
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.save()

    refresh = RefreshToken.for_user(user)
    serializer = UserSerializer(user, context={'request': request})

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': serializer.data,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Ensure profile exists
        UserProfile.objects.get_or_create(user=user)
        return Response({"message": "User created successfully", "user": UserSerializer(user, context={'request': request}).data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def contact_message_view(request):
    serializer = ContactMessageSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if not settings.CONTACT_EMAIL:
        return Response({'error': 'Contact inbox is not configured yet.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    name = serializer.validated_data['name']
    email = serializer.validated_data['email']
    message = serializer.validated_data['message']

    try:
        email_message = EmailMessage(
            subject=f'New contact form message from {name}',
            body=f"From: {name} <{email}>\n\n{message}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[settings.CONTACT_EMAIL],
            reply_to=[email],
        )
        email_message.send(fail_silently=False)
    except Exception:
        return Response({'error': "We couldn't send your message right now. Please try again shortly."}, status=status.HTTP_502_BAD_GATEWAY)

    return Response({'message': "Thanks for reaching out — we'll get back to you soon."})


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request_view(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email']
    generic_response = Response({'message': 'If an account exists for that email, a reset link has been sent.'})

    user = User.objects.filter(email__iexact=email).first()
    if not user:
        # Don't reveal whether the email is registered.
        return generic_response

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

    send_mail(
        subject='Reset your LeloVaiLelo password',
        message=(
            f"Hi {user.first_name or user.username},\n\n"
            f"We received a request to reset your LeloVaiLelo password. Click the link below to choose a new one:\n\n"
            f"{reset_link}\n\n"
            f"If you didn't request this, you can safely ignore this email.\n\n"
            f"This link will expire once used or after Django's default token timeout."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
    return generic_response


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm_view(request):
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    uid = serializer.validated_data['uid']
    token = serializer.validated_data['token']
    new_password = serializer.validated_data['new_password']

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except (User.DoesNotExist, ValueError, TypeError, OverflowError):
        return Response({'error': 'Invalid or expired reset link'}, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, token):
        return Response({'error': 'Invalid or expired reset link'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_password(new_password, user=user)
    except DjangoValidationError as e:
        return Response({'new_password': e.messages}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    return Response({'message': 'Password reset successfully. You can now log in.'})

# ✅ profile endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_me(request):
    serializer = UserSerializer(request.user, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_orders(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard(request):
    user = request.user
    is_admin = user.is_staff or user.is_superuser
    
    if is_admin:
        # Admin Dashboard Data
        products = Product.objects.all()
        orders = Order.objects.all().order_by('-created_at')
        
        revenue = sum(order.total_amount for order in orders)
        total_customers = Order.objects.values('user').distinct().count()
        
        return Response({
            'role': 'admin',
            'user': UserSerializer(user, context={'request': request}).data,
            'stats': {
                'totalProducts': products.count(),
                'totalOrders': orders.count(),
                'totalRevenue': str(revenue),
                'totalCustomers': total_customers,
            },
            'products': ProductSerializer(products[:20], many=True).data,
            'orders': OrderSerializer(orders[:5], many=True).data,
        })
    else:
        # Customer Dashboard Data
        orders = Order.objects.filter(user=user).order_by('-created_at')
        cart, _ = Cart.objects.get_or_create(user=user)
        
        total_spent = sum(order.total_amount for order in orders)
        last_order_date = orders.first().created_at if orders.exists() else None
        
        return Response({
            'role': 'customer',
            'user': UserSerializer(user, context={'request': request}).data,
            'stats': {
                'totalOrders': orders.count(),
                'totalSpent': str(total_spent),
                'lastOrderDate': last_order_date,
                'cartItems': cart.items.count(),
            },
            'orders': OrderSerializer(orders[:5], many=True).data,
        })

# ========== PRODUCT MANAGEMENT (ADMIN ONLY) ==========

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser, MultiPartParser, FormParser])
def create_product(request):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        serializer = ProductSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser, MultiPartParser, FormParser])
def update_product(request, pk):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        product = Product.objects.get(id=pk)
        serializer = ProductSerializer(product, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_product(request, pk):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        product = Product.objects.get(id=pk)
        product.delete()
        return Response({'message': 'Product deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_overview(request):
    denied = _admin_required(request)
    if denied:
        return denied
    products = Product.objects.select_related('category').order_by('-created_at')
    orders = Order.objects.select_related('user').prefetch_related('items__product').order_by('-created_at')
    customers = User.objects.filter(is_staff=False, is_superuser=False)
    return Response({
        'stats': {
            'totalProducts': products.count(),
            'totalOrders': orders.count(),
            'totalRevenue': str(orders.aggregate(total=Coalesce(Sum('total_amount'), Value(0), output_field=DecimalField()))['total']),
            'totalCustomers': customers.count(),
            'lowStock': products.filter(stock__lte=5).count(),
            'pendingOrders': orders.filter(status='pending').count(),
        },
        'products': ProductSerializer(products, many=True, context={'request': request}).data,
        'orders': OrderSerializer(orders, many=True, context={'request': request}).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_orders(request):
    denied = _admin_required(request)
    if denied:
        return denied
    orders = Order.objects.select_related('user').prefetch_related('items__product').order_by('-created_at')
    return Response(OrderSerializer(orders, many=True, context={'request': request}).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def admin_update_order(request, pk):
    denied = _admin_required(request)
    if denied:
        return denied
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    new_status = request.data.get('status')
    valid = {choice[0] for choice in Order.STATUS_CHOICES}
    if new_status not in valid:
        return Response({'error': 'Invalid order status'}, status=status.HTTP_400_BAD_REQUEST)
    order.status = new_status
    order.save(update_fields=['status'])
    return Response(OrderSerializer(order, context={'request': request}).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_customers(request):
    denied = _admin_required(request)
    if denied:
        return denied
    customers = User.objects.filter(is_staff=False, is_superuser=False).annotate(
        order_count=Count('order', distinct=True),
        total_spent=Coalesce(Sum('order__total_amount'), Value(0), output_field=DecimalField()),
    ).order_by('-date_joined')
    return Response(AdminCustomerSerializer(customers, many=True).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def admin_update_customer(request, pk):
    denied = _admin_required(request)
    if denied:
        return denied
    try:
        customer = User.objects.get(pk=pk, is_staff=False, is_superuser=False)
    except User.DoesNotExist:
        return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
    if 'is_active' in request.data:
        customer.is_active = bool(request.data['is_active'])
    for field in ('first_name', 'last_name', 'email'):
        if field in request.data:
            setattr(customer, field, request.data[field])
    customer.save()
    customer = User.objects.filter(pk=customer.pk).annotate(
        order_count=Count('order', distinct=True),
        total_spent=Coalesce(Sum('order__total_amount'), Value(0), output_field=DecimalField()),
    ).get()
    return Response(AdminCustomerSerializer(customer).data)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser, MultiPartParser, FormParser])
def update_profile(request):
    try:
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)

        # allow both form-data and json
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        email = request.data.get('email')
        phone = request.data.get('phone')
        address = request.data.get('address')

        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        if email is not None:
            user.email = email

        if phone is not None:
            profile.phone = phone
        if address is not None:
            profile.address = address

        if 'avatar' in request.FILES:
            profile.avatar = request.FILES['avatar']

        user.save()
        profile.save()

        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
