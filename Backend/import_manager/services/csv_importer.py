import csv
from django.db import transaction
from django.utils import timezone
from product.models import ProductProduct
from import_manager.models import ImportJob
from webhook.tasks import trigger_webhook_async

class CSVImporter:
    def __init__(self, job_id, file_path):
        self.job_id = job_id
        self.file_path = file_path
        self.job = ImportJob.objects.get(job_id=job_id)
        self.chunk_size = 1000
    
    def process(self):
        """Process CSV import in chunks"""
        try:
            self.job.status = 'processing'
            self.job.started_at = timezone.now()
            self.job.save()
            
            with open(self.file_path, 'r') as file:
                reader = csv.DictReader(file)
                
                # Count total rows
                rows = list(reader)
                self.job.total_rows = len(rows)
                self.job.save()
                
                # Process in chunks
                for i in range(0, len(rows), self.chunk_size):
                    chunk = rows[i:i + self.chunk_size]
                    self._process_chunk(chunk)
                    
                    # Update progress
                    self.job.processed_rows = min(i + self.chunk_size, len(rows))
                    self.job.save()
            
            # Mark as completed
            self.job.status = 'completed'
            self.job.completed_at = timezone.now()
            self.job.save()
            
        except Exception as e:
            self.job.status = 'failed'
            self.job.errors.append(str(e))
            self.job.save()
    
    def _process_chunk(self, chunk):
        """Process a chunk of CSV rows"""
        for row in chunk:
            try:
                with transaction.atomic():
                    product, created = ProductProduct.objects.update_or_create(
                        sku=row['sku'].upper(),
                        defaults={
                            'name': row['name'],
                            'description': row.get('description', ''),
                            'price': float(row['price']),
                        }
                    )
                    
                    self.job.success_count += 1
                    
                    # Trigger webhook
                    event = 'product.created' if created else 'product.updated'
                    trigger_webhook_async.delay(event, product.id)
                    
            except Exception as e:
                self.job.error_count += 1
                self.job.errors.append({
                    'row': row,
                    'error': str(e)
                })