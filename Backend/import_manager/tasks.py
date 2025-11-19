from celery import shared_task
from .services.csv_importer import CSVImporter

@shared_task
def process_csv_import(job_id, file_path):
    """
    Process CSV import asynchronously
    """
    importer = CSVImporter(job_id, file_path)
    importer.process()
    return f"Import job {job_id} completed"