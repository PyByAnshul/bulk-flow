import uuid
from django.db import models
from core.models import BaseModel

class ImportJob(BaseModel):
    """Track CSV import jobs"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    job_id = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    filename = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_rows = models.IntegerField(default=0)
    processed_rows = models.IntegerField(default=0)
    success_count = models.IntegerField(default=0)
    error_count = models.IntegerField(default=0)
    errors = models.JSONField(default=list, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'import_job'
        ordering = ['-created_at']
    
    @property
    def progress(self):
        """Calculate progress percentage"""
        if self.total_rows == 0:
            return 0
        return int((self.processed_rows / self.total_rows) * 100)