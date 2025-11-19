from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import WebhookConfig
from .serializers import WebhookSerializer
from .services.webhook_executor import test_webhook_sync

class WebhookViewSet(viewsets.ModelViewSet):
    """
    Webhook CRUD operations
    
    list: GET /api/webhooks/
    create: POST /api/webhooks/
    retrieve: GET /api/webhooks/{id}/
    update: PUT /api/webhooks/{id}/
    destroy: DELETE /api/webhooks/{id}/
    """
    queryset = WebhookConfig.objects.all()
    serializer_class = WebhookSerializer
    
    def list(self, request):
        """GET /api/webhooks/"""
        webhooks = self.get_queryset()
        serializer = self.get_serializer(webhooks, many=True)
        return Response({'data': serializer.data})
    
    def create(self, request):
        """POST /api/webhooks/"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            webhook = serializer.save()
            return Response({'data': serializer.data}, status=status.HTTP_201_CREATED)
        return Response({
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid webhook data',
                'details': [{'field': field, 'message': error[0]} for field, error in serializer.errors.items()]
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        """PUT /api/webhooks/{id}/"""
        webhook = self.get_object()
        serializer = self.get_serializer(webhook, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'data': serializer.data})
        return Response({
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid webhook data',
                'details': [{'field': field, 'message': error[0]} for field, error in serializer.errors.items()]
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def test(self, request, pk=None):
        """POST /api/webhooks/{id}/test/"""
        webhook = self.get_object()
        result = test_webhook_sync(webhook)
        return Response({'message': 'Test webhook sent successfully'})