from django.contrib import admin
from .models import ProductProduct

@admin.register(ProductProduct)
class ProductProductAdmin(admin.ModelAdmin):
    list_display = ['sku', 'name', 'price', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['sku', 'name']
    ordering = ['-created_at']