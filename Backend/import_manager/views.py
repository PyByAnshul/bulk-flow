import uuid
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ImportJob
from .serializers import ImportJobSerializer
from .tasks import process_csv_import

@api_view(['POST'])
def upload_csv(request):
    """
    POST /api/upload
    Upload CSV file and start import job
    """
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    file = request.FILES['file']
    
    if not file.name.endswith('.csv'):
        return Response({'error': 'Only CSV files are allowed'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create import job
    job_id = uuid.uuid4()
    import_job = ImportJob.objects.create(
        job_id=job_id,
        filename=file.name,
        status='pending'
    )
    
    # Save file temporarily and trigger Celery task
    import tempfile
    import os
    
    temp_dir = tempfile.gettempdir()
    file_path = os.path.join(temp_dir, f'{job_id}.csv')
    
    with open(file_path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)
    
    # Start async processing
    process_csv_import.delay(str(job_id), file_path)
    
    return Response({
        'job_id': str(job_id),
        'message': 'Upload started successfully'
    }, status=status.HTTP_202_ACCEPTED)

@api_view(['GET'])
def job_progress(request, job_id):
    """
    GET /api/jobs/{job_id}
    Get import job progress
    """
    try:
        job = ImportJob.objects.get(job_id=job_id)
        serializer = ImportJobSerializer(job)
        return Response(serializer.data)
    except ImportJob.DoesNotExist:
        return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def jobs_list(request):
    """
    GET /api/jobs
    Get all import jobs
    """
    try:
        jobs = ImportJob.objects.all()
        data = []
        for job in jobs:
            data.append({
                'job_id': str(job.job_id),
                'file_name': job.filename,
                'status': job.status,
                'progress_percentage': job.progress,
                'total_rows': job.total_rows,
                'processed_rows': job.processed_rows,
                'failed_rows': job.error_count,
                'created_at': job.created_at,
                'completed_at': job.completed_at
            })
        return Response({'data': data})
    except Exception as e:
        return Response({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Failed to retrieve jobs'
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)