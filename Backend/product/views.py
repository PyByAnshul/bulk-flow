from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import ProductProduct
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    """
    Product CRUD operations
    
    list: GET /api/products/
    create: POST /api/products/
    retrieve: GET /api/products/{id}/
    update: PUT /api/products/{id}/
    partial_update: PATCH /api/products/{id}/
    destroy: DELETE /api/products/{id}/
    """
    queryset = ProductProduct.objects.all()
    serializer_class = ProductSerializer
    
    def get_queryset(self):
        queryset = ProductProduct.objects.all()
        
        # Enhanced search filters
        sku = self.request.query_params.get('sku')
        name = self.request.query_params.get('name')
        description = self.request.query_params.get('description')
        is_active = self.request.query_params.get('is_active')
        
        if sku:
            queryset = queryset.filter(Q(sku__icontains=sku) | Q(sku__istartswith=sku))
        
        if name:
            queryset = queryset.filter(name__icontains=name)
        
        if description:
            queryset = queryset.filter(description__icontains=description)
        
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)
        
        return queryset
    
    def list(self, request):
        """GET /api/products/ with enhanced search"""
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            
            # Wrap in data format
            response_data = {
                'data': serializer.data,
                'page': int(request.query_params.get('page', 1)),
                'page_size': int(request.query_params.get('page_size', 50)),
                'total': queryset.count(),
                'count': queryset.count(),
                'next': paginated_response.data.get('next'),
                'previous': paginated_response.data.get('previous'),
                'results': serializer.data
            }
            return Response(response_data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({'data': serializer.data})
    
    @action(detail=False, methods=['delete'], url_path='bulk-delete')
    def bulk_delete(self, request):
        """DELETE /api/products/bulk-delete/"""
        count = ProductProduct.objects.all().count()
        ProductProduct.objects.all().delete()
        return Response({
            'deleted_count': count,
            'message': f'Successfully deleted {count} products'
        })