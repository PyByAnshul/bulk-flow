from rest_framework import serializers
from .models import ImportJob

class ImportJobSerializer(serializers.ModelSerializer):
    progress = serializers.ReadOnlyField()
    
    class Meta:
        model = ImportJob
        fields = ['job_id', 'filename', 'status', 'total_rows', 'processed_rows', 
                 'success_count', 'error_count', 'errors', 'progress', 
                 'started_at', 'completed_at', 'created_at']
        read_only_fields = ['job_id', 'created_at']