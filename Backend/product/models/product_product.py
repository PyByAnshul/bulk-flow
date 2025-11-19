from django.db import models
from core.models import BaseModel

class ProductProduct(BaseModel):
    """Product model - stores individual products"""
    sku = models.CharField(max_length=100, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(null=True, blank=True)
    
    class Meta:
        db_table = 'product_product'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['name']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.sku} - {self.name}"
    
    def save(self, *args, **kwargs):
        # Ensure SKU is case-insensitive unique
        self.sku = self.sku.upper()
        super().save(*args, **kwargs)