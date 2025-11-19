from django.contrib import admin
from .models import WebhookConfig, WebhookLog

@admin.register(WebhookConfig)
class WebhookConfigAdmin(admin.ModelAdmin):
    list_display = ['url', 'is_enabled', 'created_at']
    list_filter = ['is_enabled', 'created_at']
    search_fields = ['url']
    ordering = ['-created_at']

@admin.register(WebhookLog)
class WebhookLogAdmin(admin.ModelAdmin):
    list_display = ['webhook', 'event_type', 'success', 'status_code', 'response_time', 'created_at']
    list_filter = ['success', 'event_type', 'created_at']
    search_fields = ['webhook__url', 'event_type']
    ordering = ['-created_at']
    readonly_fields = ['webhook', 'event_type', 'payload', 'status_code', 'response_body', 
                      'response_time', 'success', 'error_message', 'created_at']