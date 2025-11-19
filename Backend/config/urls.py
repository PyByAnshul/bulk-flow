from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from core.views import dashboard_stats

def health_check(request):
    return JsonResponse({'status': 'healthy', 'message': 'API is running'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    path('api/', include('product.urls')),
    path('api/', include('import_manager.urls')),
    path('api/', include('webhook.urls')),
    path('api/dashboard/stats', dashboard_stats, name='dashboard_stats'),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]