from django.contrib import admin
from .models import ImportJob

@admin.register(ImportJob)
class ImportJobAdmin(admin.ModelAdmin):
    list_display = ['job_id', 'filename', 'status', 'progress', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['filename', 'job_id']
    ordering = ['-created_at']
    readonly_fields = ['job_id', 'progress']