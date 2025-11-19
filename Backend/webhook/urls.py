from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WebhookViewSet

router = DefaultRouter()
router.register('webhooks', WebhookViewSet)

urlpatterns = [
    path('', include(router.urls)),
]