import io
import tempfile
from decimal import Decimal
from pathlib import Path
from PIL import Image
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from .models import Category, Product, Cart, CartItem, Order, OrderItem


class ClothingTests(TestCase):
    def setUp(self):
        self.media = tempfile.TemporaryDirectory()
        self.addCleanup(self.media.cleanup)
        override = override_settings(MEDIA_ROOT=self.media.name)
        override.enable()
        self.addCleanup(override.disable)
        self.admin = User.objects.create_user('admin-test', password='unused', is_staff=True)
        self.customer = User.objects.create_user('customer-test', password='unused')
        self.other = User.objects.create_user('other-test', password='unused')
        self.client = APIClient()
        self.client.force_authenticate(self.admin)
        self.men = Category.objects.create(name='Men', slug='men')
        self.women = Category.objects.create(name='Women', slug='women')
        self.jackets = Category.objects.create(name='Jackets', slug='men-jackets', parent=self.men)
        self.product = Product.objects.create(name='Test jacket', category=self.jackets, price='48.50', stock=5)

    def test_subcategory_names_are_scoped_to_parent_and_depth_is_limited(self):
        self.assertEqual(self.client.post('/api/categories/create/', {'name': 'Jackets', 'parent': self.women.pk}).status_code, 201)
        self.assertEqual(self.client.post('/api/categories/create/', {'name': 'jackets', 'parent': self.men.pk}).status_code, 400)
        self.assertEqual(self.client.post('/api/categories/create/', {'name': 'Deep', 'parent': self.jackets.pk}).status_code, 400)
        self.assertEqual(self.client.patch(f'/api/categories/{self.men.pk}/update/', {'parent': self.women.pk}).status_code, 400)
        self.assertEqual(self.client.delete(f'/api/categories/{self.men.pk}/delete/').status_code, 400)

    def test_customer_cannot_manage_catalog(self):
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.post('/api/categories/create/', {'name': 'Kids'}).status_code, 403)
        self.assertEqual(self.client.post('/api/products/create/', {'name': 'Unauthorized'}).status_code, 403)

    def test_product_slugs_are_unique_stable_and_support_legacy_urls(self):
        duplicate = Product.objects.create(name=self.product.name, category=self.jackets, price='20')
        self.assertNotEqual(self.product.slug, duplicate.slug)
        original = self.product.slug
        self.product.name = 'Renamed jacket'
        self.product.save()
        self.product.refresh_from_db()
        self.assertEqual(self.product.slug, original)
        self.client.force_authenticate(None)
        for url in [f'/api/products/{self.product.pk}/', f'/api/products/by-slug/{original}/']:
            response = self.client.get(url)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data['id'], self.product.pk)
            self.assertEqual(response.data['slug'], original)
        self.assertEqual(self.client.get('/api/products/by-slug/missing/').status_code, 404)

    def test_category_slug_survives_renaming(self):
        response = self.client.patch(f'/api/categories/{self.jackets.pk}/update/', {'name': 'Coats'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['slug'], 'men-jackets')

    def test_upload_jpeg_png_webp_gif_and_reject_disguised_file(self):
        for format_name, extension, mime in [('JPEG', 'jpg', 'image/jpeg'), ('PNG', 'png', 'image/png'), ('WEBP', 'webp', 'image/webp'), ('GIF', 'gif', 'image/gif')]:
            with self.subTest(format=format_name):
                data = io.BytesIO()
                Image.new('RGB', (8, 8), 'green').save(data, format=format_name)
                response = self.client.post('/api/products/create/', {'name': 'Uploaded jacket', 'price': '20.00', 'stock': 3, 'category_id': self.jackets.pk, 'image': SimpleUploadedFile(f'photo.{extension}', data.getvalue(), mime), 'image_url': 'https://example.com/old.jpg'}, format='multipart')
                self.assertEqual(response.status_code, 201, response.data)
                created = Product.objects.get(pk=response.data['id'])
                self.assertTrue(created.image.name.endswith(extension))
                self.assertEqual(created.image_url, '')
                self.assertIn('/media/products/', response.data['image_url'])
        bad = self.client.post('/api/products/create/', {'name': 'Invalid', 'price': '20', 'category_id': self.jackets.pk, 'image': SimpleUploadedFile('fake.jpg', b'not-an-image', 'image/jpeg')}, format='multipart')
        self.assertEqual(bad.status_code, 400)

    def test_product_requires_subcategory(self):
        response = self.client.post('/api/products/create/', {'name': 'Bad category', 'price': '20', 'category_id': self.men.pk})
        self.assertEqual(response.status_code, 400)

    def test_photo_can_be_replaced_and_switched_to_url(self):
        data = io.BytesIO()
        Image.new('RGB', (8, 8), 'blue').save(data, format='PNG')
        response = self.client.put(f'/api/products/{self.product.pk}/update/', {'image': SimpleUploadedFile('replacement.png', data.getvalue(), 'image/png')}, format='multipart')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertIn('.png', response.data['image_url'])
        response = self.client.put(f'/api/products/{self.product.pk}/update/', {'image': '', 'image_url': 'https://example.com/jacket.jpg'}, format='multipart')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['image_url'], 'https://example.com/jacket.jpg')

    def test_delivery_and_historical_product_names_are_returned_in_orders(self):
        self.client.force_authenticate(self.customer)
        order = Order.objects.create(user=self.customer, total_amount='48.50', name='Test Customer', address='Saved address', phone='9800000000')
        OrderItem.objects.create(order=order, product=self.product, product_name=self.product.name, price=self.product.price)
        self.product.delete()
        response = self.client.get('/api/orders/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]['address'], 'Saved address')
        self.assertEqual(response.data[0]['items'][0]['product_name'], 'Test jacket')

    def test_cart_limits_and_ownership(self):
        cart = Cart.objects.create(user=self.other)
        item = CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        self.client.force_authenticate(self.customer)
        for endpoint, payload in [('update', {'item_id': item.pk, 'quantity': 2}), ('remove', {'item_id': item.pk})]:
            self.assertEqual(self.client.post(f'/api/cart/{endpoint}/', payload).status_code, 404)
        self.assertTrue(CartItem.objects.filter(pk=item.pk).exists())
        self.assertEqual(self.client.post('/api/cart/add/', {'product_id': self.product.pk, 'quantity': 6}).status_code, 400)
        self.assertEqual(self.client.post('/api/cart/add/', {'product_id': self.product.pk, 'quantity': 2}).status_code, 200)
        self.assertEqual(self.client.post('/api/cart/add/', {'product_id': self.product.pk, 'quantity': 4}).status_code, 400)

    def test_checkout_saves_delivery_reduces_stock_and_cannot_repeat(self):
        self.client.force_authenticate(self.customer)
        self.client.post('/api/cart/add/', {'product_id': self.product.pk, 'quantity': 2})
        payload = {'name': 'Test Customer', 'address': 'Test address, Kathmandu', 'phone': '9800000000', 'payment_method': 'COD'}
        response = self.client.post('/api/orders/create/', payload, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        order = Order.objects.get(pk=response.data['order_id'])
        self.assertEqual(order.total_amount, Decimal('97.00'))
        self.assertEqual(order.address, payload['address'])
        self.assertEqual(order.name, payload['name'])
        self.assertEqual(order.phone, payload['phone'])
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3)
        self.assertEqual(order.items.get().product_name, 'Test jacket')
        self.assertEqual(self.client.post('/api/orders/create/', payload).status_code, 400)
        self.assertEqual(Order.objects.count(), 1)

    def test_insufficient_stock_and_invalid_delivery_do_not_change_cart(self):
        self.client.force_authenticate(self.customer)
        cart = Cart.objects.create(user=self.customer)
        CartItem.objects.create(cart=cart, product=self.product, quantity=6)
        payload = {'name': 'Test', 'address': 'Test address', 'phone': '9800000000', 'payment_method': 'COD'}
        self.assertEqual(self.client.post('/api/orders/create/', payload).status_code, 400)
        self.assertEqual(self.client.post('/api/orders/create/', {**payload, 'phone': None}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/orders/create/', {**payload, 'payment_method': 'CARD'}).status_code, 400)
        self.assertEqual(Order.objects.count(), 0)
        self.assertEqual(cart.items.count(), 1)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 5)

    def test_deleting_product_preserves_order_snapshot(self):
        order = Order.objects.create(user=self.customer, total_amount='48.50')
        item = OrderItem.objects.create(order=order, product=self.product, product_name=self.product.name, price=self.product.price)
        self.product.delete()
        item.refresh_from_db()
        self.assertIsNone(item.product_id)
        self.assertEqual(item.product_name, 'Test jacket')
        self.assertEqual(order.items.count(), 1)

    def test_catalog_reset_backs_up_and_preserves_history_and_accounts(self):
        from .management.commands.reset_clothing_catalog import PRODUCTS
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            images = root / 'images'
            images.mkdir()
            for *_, filename, description in PRODUCTS:
                Image.new('RGB', (4, 4)).save(images / filename, format='JPEG')
            order = Order.objects.create(user=self.customer, total_amount='48.50')
            OrderItem.objects.create(order=order, product=self.product, price=self.product.price)
            with override_settings(BASE_DIR=root):
                call_command('reset_clothing_catalog', replace=True, image_dir=images, stdout=io.StringIO())
            self.assertEqual(set(Category.objects.filter(parent=None).values_list('name', flat=True)), {'Men', 'Women', 'Kids'})
            self.assertEqual(Product.objects.count(), 9)
            self.assertFalse(Product.objects.filter(category__parent=None).exists())
            self.assertTrue(all(product.image and product.stock > 0 for product in Product.objects.all()))
            self.assertEqual(order.items.get().product_name, 'Test jacket')
            self.assertEqual(User.objects.count(), 3)
            self.assertEqual(len(list((root / '.backups').glob('*.json'))), 1)
