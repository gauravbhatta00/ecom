from django.contrib import admin

# Register your models here.
from .models import Category,Product,UserProfile,Order,OrderItem

admin.site.register(Category)
admin.site.register(Product)            
admin.site.register(UserProfile)
admin.site.register(Order)  
admin.site.register(OrderItem)