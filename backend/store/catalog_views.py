from django.db.models.deletion import ProtectedError
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from .models import Category
from .serializers import CategorySerializer


class StoreAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)


@api_view(['POST'])
@permission_classes([StoreAdmin])
def create_category(request):
    serializer = CategorySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=201)


@api_view(['PATCH'])
@permission_classes([StoreAdmin])
def update_category(request, pk):
    category = get_object_or_404(Category, pk=pk)
    serializer = CategorySerializer(category, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([StoreAdmin])
def delete_category(request, pk):
    category = get_object_or_404(Category, pk=pk)
    if category.products.exists() or category.children.exists():
        return Response({'error': 'Move or remove the products and subcategories first.'}, status=400)
    try:
        category.delete()
    except ProtectedError:
        return Response({'error': 'This category still has subcategories.'}, status=400)
    return Response(status=204)
