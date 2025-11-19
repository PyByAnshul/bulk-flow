from celery import shared_task
from .services.webhook_executor import execute_webhook

@shared_task
def trigger_webhook_async(event_type, product_id):
    """Trigger webhooks asynchronously"""
    execute_webhook(event_type, product_id)