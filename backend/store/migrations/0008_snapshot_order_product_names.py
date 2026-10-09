from django.db import migrations


def snapshot_names(apps, schema_editor):
    OrderItem = apps.get_model('store', 'OrderItem')
    for item in OrderItem.objects.using(schema_editor.connection.alias).select_related('product').filter(product_name=''):
        if item.product:
            item.product_name = item.product.name
            item.save(update_fields=['product_name'])


class Migration(migrations.Migration):
    dependencies = [('store', '0007_alter_category_options_category_parent_order_address_and_more')]
    operations = [migrations.RunPython(snapshot_names, migrations.RunPython.noop)]
