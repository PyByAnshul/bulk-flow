from django.urls import path
from .views import upload_csv, job_progress, jobs_list

urlpatterns = [
    path('upload', upload_csv, name='upload_csv'),
    path('jobs', jobs_list, name='jobs_list'),
    path('jobs/<uuid:job_id>', job_progress, name='job_progress'),
]