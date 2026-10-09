from django.db import migrations, models
from django.utils.text import slugify


def populate_slugs(apps, schema_editor):
    Product = apps.get_model('store', 'Product')
    for product in Product.objects.using(schema_editor.connection.alias).all().iterator():
        product.slug = f'{slugify(product.name)[:200] or "product"}-{product.pk}'
        product.save(update_fields=['slug'])


class Migration(migrations.Migration):
    dependencies = [('store', '0008_snapshot_order_product_names')]
    operations = [
        migrations.AddField(model_name='product', name='slug', field=models.SlugField(blank=True, editable=False, max_length=220, null=True, unique=True)),
        migrations.RunPython(populate_slugs, migrations.RunPython.noop),
    ]
