import time
import requests
from django.utils import timezone
from product.models import ProductProduct
from webhook.models import WebhookConfig, WebhookLog

def execute_webhook(event_type, product_id):
    """Execute webhooks for a specific event"""
    try:
        product = ProductProduct.objects.get(id=product_id)
        
        # Get all enabled webhooks that listen to this event
        webhooks = WebhookConfig.objects.filter(
            is_enabled=True,
            event_types__contains=[event_type]
        )
        
        payload = {
            'event_type': event_type,
            'timestamp': timezone.now().isoformat(),
            'data': {
                'id': product.id,
                'sku': product.sku,
                'name': product.name,
                'description': product.description,
                'price': float(product.price),
                'is_active': product.is_active,
            }
        }
        
        for webhook in webhooks:
            _send_webhook(webhook, event_type, payload)
            
    except ProductProduct.DoesNotExist:
        pass

def _send_webhook(webhook, event_type, payload):
    """Send individual webhook"""
    start_time = time.time()
    
    try:
        response = requests.post(
            webhook.url,
            json=payload,
            timeout=30,
            headers={'Content-Type': 'application/json'}
        )
        
        response_time = time.time() - start_time
        success = 200 <= response.status_code < 300
        
        WebhookLog.objects.create(
            webhook=webhook,
            event_type=event_type,
            payload=payload,
            status_code=response.status_code,
            response_body=response.text[:1000],  # Limit response body size
            response_time=response_time,
            success=success
        )
        
    except Exception as e:
        response_time = time.time() - start_time
        
        WebhookLog.objects.create(
            webhook=webhook,
            event_type=event_type,
            payload=payload,
            response_time=response_time,
            success=False,
            error_message=str(e)
        )

def test_webhook_sync(webhook):
    """Test webhook synchronously"""
    test_payload = {
        'event_type': 'test',
        'timestamp': timezone.now().isoformat(),
        'data': {
            'message': 'This is a test webhook'
        }
    }
    
    start_time = time.time()
    
    try:
        response = requests.post(
            webhook.url,
            json=test_payload,
            timeout=10,
            headers={'Content-Type': 'application/json'}
        )
        
        response_time = time.time() - start_time
        success = 200 <= response.status_code < 300
        
        return {
            'success': success,
            'status_code': response.status_code,
            'response_time': response_time,
            'response_body': response.text[:500],
            'message': 'Test webhook sent successfully' if success else 'Test webhook failed'
        }
        
    except Exception as e:
        response_time = time.time() - start_time
        
        return {
            'success': False,
            'response_time': response_time,
            'error_message': str(e),
            'message': 'Test webhook failed'
        }