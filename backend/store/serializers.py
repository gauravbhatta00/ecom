from rest_framework import serializers
from .models import Product, Category, Cart, CartItem, UserProfile, Order, OrderItem
from django.contrib.auth.models import User
from django.utils.text import slugify
from decimal import Decimal

class CategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True, default=None)
    parent_slug = serializers.CharField(source='parent.slug', read_only=True, default=None)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent', 'parent_name', 'parent_slug']
        read_only_fields = ['slug']
        validators = []

    def validate(self, attrs):
        name = attrs.get('name', getattr(self.instance, 'name', '')).strip()
        parent = attrs.get('parent', getattr(self.instance, 'parent', None))
        if not name or not slugify(name):
            raise serializers.ValidationError({'name': 'Enter a category name containing letters or numbers.'})
        if parent and (parent.parent_id or (self.instance and parent.pk == self.instance.pk)):
            raise serializers.ValidationError({'parent': 'Choose a top-level category such as Men, Women, or Kids.'})
        if self.instance and parent and self.instance.children.exists():
            raise serializers.ValidationError({'parent': 'A category with subcategories cannot become a subcategory.'})
        if self.instance and parent is None and self.instance.products.exists():
            raise serializers.ValidationError({'parent': 'Products must remain assigned to a subcategory.'})
        matches = Category.objects.filter(parent=parent, name__iexact=name)
        if self.instance:
            matches = matches.exclude(pk=self.instance.pk)
        if matches.exists():
            raise serializers.ValidationError({'name': 'This name already exists in the selected category.'})
        attrs['name'] = name
        base = slugify(f'{parent.slug}-{name}' if parent else name)[:45]
        slug = base
        suffix = 2
        while Category.objects.filter(slug=slug).exclude(pk=getattr(self.instance, 'pk', None)).exists():
            slug = f'{base}-{suffix}'
            suffix += 1
        attrs['slug'] = self.instance.slug if self.instance else slug
        return attrs

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    image_url = serializers.URLField(required=False, allow_blank=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), write_only=True, source='category')

    def validate_category_id(self, category):
        if category.parent_id is None:
            raise serializers.ValidationError('Choose a clothing subcategory, not a top-level category.')
        return category

    def validate_price(self, value):
        if value < Decimal('0'):
            raise serializers.ValidationError('Price cannot be negative.')
        return value

    def validate_image(self, value):
        if value and value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError('Choose an image smaller than 10 MB.')
        if value and getattr(value, 'image', None) and value.image.format not in ('JPEG', 'PNG', 'WEBP', 'GIF'):
            raise serializers.ValidationError('Use a JPG, PNG, WebP, or GIF image.')
        return value

    def validate(self, attrs):
        if attrs.get('image'):
            attrs['image_url'] = ''
        return attrs

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'price', 'category', 'category_id', 'image', 'image_url', 'stock', 'created_at']
        read_only_fields = ['slug']
    
    def to_representation(self, instance):
        # Override to show computed image URL in responses
        data = super().to_representation(instance)
        # Return web URL if available, otherwise build absolute URL from uploaded image
        if instance.image and hasattr(instance.image, 'url'):
            request = self.context.get('request')
            data['image_url'] = request.build_absolute_uri(instance.image.url) if request else instance.image.url
        elif instance.image_url:
            data['image_url'] = instance.image_url
        else:
            data['image_url'] = None
        return data

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)
    class Meta:
        model = CartItem
        fields = '__all__'
    
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.ReadOnlyField()
    class Meta:
        model = Cart
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'created_at', 'total_amount', 'status', 'customer', 'items', 'name', 'address', 'phone', 'payment_method']

    def get_customer(self, obj):
        if not obj.user:
            return None
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'name': obj.user.get_full_name() or obj.user.username,
            'email': obj.user.email,
        }


class CheckoutSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    address = serializers.CharField(max_length=2000)
    phone = serializers.RegexField(r'^\d{10,15}$')
    payment_method = serializers.ChoiceField(choices=['COD'], default='COD')


class AdminCustomerSerializer(serializers.ModelSerializer):
    order_count = serializers.IntegerField(read_only=True)
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'date_joined', 'order_count', 'total_spent']

class UserProfileSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['phone', 'address', 'avatar', 'avatar_url']

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return None

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(source='userprofile', read_only=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile', 'role']
    
    def get_role(self, obj):
        if obj.is_staff or obj.is_superuser:
            return 'admin'
        return 'customer'

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data
    
    def create(self, validated_data):
        username = validated_data['username']
        email = validated_data.get('email', '')
        password = validated_data['password']
        user = User.objects.create_user(username=username, email=email, password=password)
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ContactMessageSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    message = serializers.CharField(max_length=5000)


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    new_password2 = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data
