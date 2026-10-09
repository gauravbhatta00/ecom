import json
from datetime import datetime
from pathlib import Path
from uuid import uuid4
from django.conf import settings
from django.core import serializers
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils.text import slugify
from store.models import Category, Product, Cart, CartItem, Order, OrderItem


DEPARTMENTS = {
    'Men': ['Shirts & T-shirts', 'Jackets', 'Trousers', 'Knitwear'],
    'Women': ['Shirts & T-shirts', 'Jackets', 'Trousers', 'Knitwear', 'Dresses & Sets'],
    'Kids': ['Shirts & T-shirts', 'Jackets', 'Trousers', 'Knitwear', 'Dresses & Sets'],
}
PRODUCTS = [
    ('Men', 'Shirts & T-shirts', 'Everyday white crew tee', '24.00', 'cotton-tee.jpg', 'A clean white crew-neck tee for an easy everyday outfit.'),
    ('Men', 'Trousers', 'Classic denim jeans', '64.00', 'straight-jeans.jpg', 'Versatile denim for casual dressing, from weekdays to weekends.'),
    ('Men', 'Jackets', 'Midnight biker jacket', '128.00', 'leather-jacket.jpg', 'A black biker silhouette with asymmetric zip and statement hardware.'),
    ('Women', 'Trousers', 'Relaxed blush trousers', '52.00', 'tailored-trousers.jpg', 'Blush trousers with patch pockets and an easy cuffed leg.'),
    ('Women', 'Knitwear', 'Fringed knit poncho', '72.00', 'knit-sweater.jpg', 'An open-knit layer with a fringed edge and an effortless drape.'),
    ('Women', 'Jackets', 'Belted city coat', '148.00', 'wool-coat.jpg', 'Camel-coloured outerwear with generous lapels and a tie waist.'),
    ('Women', 'Dresses & Sets', 'Blue-sky maxi dress', '88.00', 'midi-dress.jpg', 'A flowing blue maxi silhouette with a delicate dotted pattern.'),
    ('Women', 'Dresses & Sets', 'Sunshine lounge set', '78.00', 'campaign.jpg', 'A cropped hoodie and matching joggers in sunshine yellow.'),
    ('Kids', 'Shirts & T-shirts', 'Little explorer printed shirt', '32.00', 'cotton-shirt.jpg', 'A playful printed shirt with a button front and easy sleeves.'),
]


class Command(BaseCommand):
    help = 'Back up and replace the catalog with orderable clothing test inventory; accounts are preserved.'

    def add_arguments(self, parser):
        parser.add_argument('--replace', action='store_true', help='Required: replace existing products and categories.')
        parser.add_argument('--clear-orders', action='store_true', help='Also remove old orders and carts; otherwise retain order snapshots.')
        parser.add_argument('--image-dir', type=Path, default=Path(settings.BASE_DIR).parent / 'frontend/public/images/fashion')

    def handle(self, *args, **options):
        if not options['replace']:
            raise CommandError('Pass --replace to confirm replacement of the existing catalog.')
        image_dir = options['image_dir'].resolve()
        image_bytes = {}
        for *_, filename, description in PRODUCTS:
            path = image_dir / filename
            if not path.is_file():
                raise CommandError(f'Missing clothing photograph: {path}')
            image_bytes[filename] = path.read_bytes()
        directory = Path(settings.BASE_DIR) / '.backups'
        directory.mkdir(exist_ok=True)
        backup = directory / f'catalog-{datetime.now():%Y%m%d-%H%M%S}-{uuid4().hex[:6]}.json'
        objects = [item for model in (Category, Product, Cart, CartItem, Order, OrderItem) for item in model.objects.all()]
        backup.write_text(serializers.serialize('json', objects, indent=2), encoding='utf-8')
        # Re-read before mutation: abort if the backup cannot be decoded.
        json.loads(backup.read_text(encoding='utf-8'))
        saved_files = []
        try:
            with transaction.atomic():
                for item in OrderItem.objects.select_related('product').filter(product_name=''):
                    if item.product:
                        item.product_name = item.product.name
                        item.save(update_fields=['product_name'])
                if options['clear_orders']:
                    Order.objects.all().delete()
                    Cart.objects.all().delete()
                Product.objects.all().delete()
                Category.objects.filter(parent__isnull=False).delete()
                Category.objects.all().delete()
                categories = {}
                for department, names in DEPARTMENTS.items():
                    parent = Category.objects.create(name=department, slug=slugify(department))
                    for name in names:
                        categories[(department, name)] = Category.objects.create(name=name, slug=slugify(f'{department}-{name}'), parent=parent)
                for department, category, name, price, filename, description in PRODUCTS:
                    product = Product(category=categories[(department, category)], name=name, price=price, stock=25, description=description + '\n\nClothing test inventory. Orders are for local testing; no online payment is collected.')
                    product.image.save(f'clothing-{uuid4().hex[:8]}-{filename}', ContentFile(image_bytes[filename]), save=False)
                    saved_files.append((product.image.storage, product.image.name))
                    product.save()
        except Exception:
            for storage, name in saved_files:
                storage.delete(name)
            raise
        self.stdout.write(self.style.SUCCESS(f'Created {len(DEPARTMENTS)} categories, {len(categories)} subcategories, and {len(PRODUCTS)} orderable products.'))
        self.stdout.write(f'Previous catalog backup: {backup}')
        self.stdout.write('Login accounts preserved. ' + ('Old orders and carts cleared.' if options['clear_orders'] else 'Existing order history preserved. Old product cart items removed.'))
