from django.db import models
from core.models import BaseModel

class WebhookConfig(BaseModel):
    """Webhook configuration"""
    url = models.URLField()
    event_types = models.JSONField(default=list)  # ['product.created', 'product.updated', 'product.deleted']
    is_enabled = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'webhook_config'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Webhook: {self.url}"