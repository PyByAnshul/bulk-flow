from rest_framework import serializers
from .models import WebhookConfig, WebhookLog

class WebhookSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookConfig
        fields = ['id', 'url', 'event_types', 'is_enabled', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class WebhookLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookLog
        fields = ['id', 'webhook', 'event_type', 'payload', 'status_code', 
                 'response_body', 'response_time', 'success', 'error_message', 'created_at']