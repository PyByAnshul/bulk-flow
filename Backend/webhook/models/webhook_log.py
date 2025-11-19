from django.db import models
from core.models import BaseModel
from .webhook_config import WebhookConfig

class WebhookLog(BaseModel):
    """Webhook execution logs"""
    webhook = models.ForeignKey(WebhookConfig, on_delete=models.CASCADE, related_name='logs')
    event_type = models.CharField(max_length=50)
    payload = models.JSONField()
    status_code = models.IntegerField(null=True)
    response_body = models.TextField(null=True, blank=True)
    response_time = models.FloatField(null=True)  # in seconds
    success = models.BooleanField(default=False)
    error_message = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'webhook_log'
        ordering = ['-created_at']