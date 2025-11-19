from rest_framework.decorators import api_view
from rest_framework.response import Response
from product.models import ProductProduct
from import_manager.models import ImportJob
from webhook.models import WebhookConfig, WebhookLog

@api_view(['GET'])
def dashboard_stats(request):
    """
    GET /api/dashboard/stats
    Get dashboard statistics
    """
    total_products = ProductProduct.objects.count()
    active_products = ProductProduct.objects.filter(is_active=True).count()
    recent_imports = ImportJob.objects.filter(status='completed').count()
    configured_webhooks = WebhookConfig.objects.filter(is_enabled=True).count()
    total_events_sent = WebhookLog.objects.filter(success=True).count()
    failed_events = WebhookLog.objects.filter(success=False).count()
    
    return Response({
        'total_products': total_products,
        'active_products': active_products,
        'recent_imports': recent_imports,
        'configured_webhooks': configured_webhooks,
        'total_events_sent': total_events_sent,
        'failed_events': failed_events,
    })