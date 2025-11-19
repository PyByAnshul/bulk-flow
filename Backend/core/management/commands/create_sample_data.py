from django.core.management.base import BaseCommand
from product.models import ProductProduct
from webhook.models import WebhookConfig

class Command(BaseCommand):
    help = 'Create sample data for testing'

    def handle(self, *args, **options):
        # Create sample products
        products_data = [
            {'sku': 'SAMPLE001', 'name': 'Sample Product 1', 'description': 'Test product 1', 'price': 29.99},
            {'sku': 'SAMPLE002', 'name': 'Sample Product 2', 'description': 'Test product 2', 'price': 49.99},
            {'sku': 'SAMPLE003', 'name': 'Sample Product 3', 'description': 'Test product 3', 'price': 19.99},
        ]
        
        for data in products_data:
            product, created = ProductProduct.objects.get_or_create(
                sku=data['sku'],
                defaults=data
            )
            if created:
                self.stdout.write(f'Created product: {product.sku}')
            else:
                self.stdout.write(f'Product already exists: {product.sku}')
        
        # Create sample webhook
        webhook, created = WebhookConfig.objects.get_or_create(
            url='https://httpbin.org/post',
            defaults={
                'event_types': ['product.created', 'product.updated'],
                'is_enabled': True
            }
        )
        
        if created:
            self.stdout.write('Created sample webhook')
        else:
            self.stdout.write('Sample webhook already exists')
        
        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))