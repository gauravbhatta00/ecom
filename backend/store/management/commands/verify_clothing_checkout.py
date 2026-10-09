import secrets
from uuid import uuid4
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken
from store.models import Product, Order, Cart


class Command(BaseCommand):
    help = 'Exercise login, cart, checkout, and order APIs inside a transaction that is always rolled back.'

    def handle(self, *args, **options):
        product = Product.objects.filter(stock__gte=2).first()
        admin = User.objects.filter(is_staff=True, is_active=True).first()
        if not product or not admin:
            raise CommandError('An in-stock product and an existing administrator are required.')
        before = (User.objects.count(), Order.objects.count(), Cart.objects.count(), product.stock)
        with transaction.atomic():
            password = secrets.token_urlsafe(30)
            customer = User.objects.create_user('clothing-check-' + uuid4().hex[:10], password=password)
            client = APIClient(HTTP_HOST='localhost')
            login = client.post('/api/token/', {'username': customer.username, 'password': password}, format='json')
            assert login.status_code == 200, 'Login failed'
            client.credentials(HTTP_AUTHORIZATION='Bearer ' + login.data['access'])
            added = client.post('/api/cart/add/', {'product_id': product.pk, 'quantity': 2}, format='json')
            assert added.status_code == 200, 'Add to cart failed'
            bag = client.get('/api/cart/')
            assert bag.status_code == 200 and bag.data['items'][0]['quantity'] == 2, 'Cart read failed'
            delivery = {'name': 'Local Checkout Test', 'address': 'Test address, Kathmandu', 'phone': '9800000000', 'payment_method': 'COD'}
            response = client.post('/api/orders/create/', delivery, format='json')
            assert response.status_code == 201, 'Checkout failed'
            order = Order.objects.get(pk=response.data['order_id'])
            assert order.total_amount == product.price * 2 and order.address == delivery['address'], 'Order details not saved'
            product.refresh_from_db()
            assert product.stock == before[3] - 2, 'Stock was not decremented'
            assert client.get('/api/cart/').data['items'] == [], 'Cart was not cleared'
            orders = client.get('/api/orders/')
            assert orders.status_code == 200 and orders.data[0]['id'] == order.pk, 'Customer order history failed'
            client.credentials(HTTP_AUTHORIZATION='Bearer ' + str(AccessToken.for_user(admin)))
            overview = client.get('/api/admin/overview/')
            assert overview.status_code == 200 and any(item['id'] == order.pk for item in overview.data['orders']), 'Admin order visibility failed'
            transaction.set_rollback(True)
        product.refresh_from_db()
        after = (User.objects.count(), Order.objects.count(), Cart.objects.count(), product.stock)
        if before != after:
            raise CommandError('Verification did not restore its initial state.')
        self.stdout.write(self.style.SUCCESS('PASS: JWT login, bag, COD checkout, delivery persistence, stock reduction, customer history, and admin order visibility. Test records rolled back.'))
