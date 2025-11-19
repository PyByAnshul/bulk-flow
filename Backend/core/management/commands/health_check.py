from django.core.management.base import BaseCommand
from django.db import connection
from django.conf import settings
import redis

class Command(BaseCommand):
    help = 'Check system health (database, redis, etc.)'

    def handle(self, *args, **options):
        # Check database connection
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            self.stdout.write(self.style.SUCCESS('✓ Database connection: OK'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Database connection: FAILED - {e}'))

        # Check Redis connection
        try:
            r = redis.from_url(settings.CELERY_BROKER_URL)
            r.ping()
            self.stdout.write(self.style.SUCCESS('✓ Redis connection: OK'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Redis connection: FAILED - {e}'))

        self.stdout.write('\nHealth check completed!')