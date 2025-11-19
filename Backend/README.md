# Product Importer Backend API

A Django REST API backend for managing product imports, webhooks, and analytics with modular architecture (Odoo-style).

## Features

- **Product Management**: Full CRUD operations with filtering and search
- **CSV Import**: Asynchronous bulk import with progress tracking
- **Webhook System**: Configurable webhooks for product events
- **Dashboard Analytics**: Real-time statistics and metrics
- **Modular Architecture**: Clean separation of concerns with Odoo-style modules

## Architecture

```
backend/
├── manage.py
├── config/                 # Django configuration
│   ├── settings.py
│   ├── urls.py
│   ├── celery.py
│   └── wsgi.py
├── core/                   # Base models and utilities
│   ├── models.py          # BaseModel abstract class
│   └── views.py           # Dashboard endpoints
├── product/                # Product management module
│   ├── models/
│   │   └── product_product.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── admin.py
├── import_manager/         # CSV import module
│   ├── models/
│   │   └── import_job.py
│   ├── services/
│   │   └── csv_importer.py
│   ├── tasks.py           # Celery tasks
│   ├── views.py
│   ├── urls.py
│   └── admin.py
└── webhook/               # Webhook management module
    ├── models/
    │   ├── webhook_config.py
    │   └── webhook_log.py
    ├── services/
    │   └── webhook_executor.py
    ├── tasks.py
    ├── views.py
    ├── urls.py
    └── admin.py
```

## Tech Stack

- **Django 5.0+** - Web framework
- **Django REST Framework** - API framework
- **PostgreSQL** - Database
- **Celery + Redis** - Async task processing
- **Python 3.11+** - Programming language

## Installation

### Prerequisites

- Python 3.11+
- PostgreSQL
- Redis

### 1. Clone and Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your database and Redis settings
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb product_importer

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 4. Start Services

```bash
# Terminal 1: Start Redis
redis-server

# Terminal 2: Start Celery worker
celery -A config worker --loglevel=info

# Terminal 3: Start Django server
python manage.py runserver
```

## API Endpoints

### Base URL
```
http://localhost:8000/api
```

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products/` | List all products with pagination and filtering |
| POST | `/products/` | Create a new product |
| GET | `/products/{id}/` | Get specific product |
| PUT | `/products/{id}/` | Update product |
| DELETE | `/products/{id}/` | Delete product |
| DELETE | `/products/bulk-delete/` | Delete all products |

**Query Parameters for GET /products/:**
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 50)
- `sku` - Filter by SKU
- `name` - Search in name
- `is_active` - Filter by active status

**Example Response:**
```json
{
  "count": 150,
  "next": "http://localhost:8000/api/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "sku": "SKU001",
      "name": "Product Name",
      "description": "Product description",
      "price": "29.99",
      "is_active": true,
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### File Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload CSV file for bulk import |
| GET | `/jobs/{job_id}` | Get import job status |

**CSV Format:**
```csv
sku,name,description,price,is_active
SKU001,Product 1,Description 1,29.99,true
SKU002,Product 2,Description 2,49.99,false
```

**Upload Response:**
```json
{
  "job_id": "uuid-1234-5678",
  "message": "Upload started successfully"
}
```

**Job Status Response:**
```json
{
  "job_id": "uuid-1234-5678",
  "filename": "products.csv",
  "status": "completed",
  "total_rows": 100,
  "processed_rows": 100,
  "success_count": 95,
  "error_count": 5,
  "progress": 100,
  "errors": [],
  "started_at": "2025-01-15T10:30:00Z",
  "completed_at": "2025-01-15T10:35:00Z",
  "created_at": "2025-01-15T10:30:00Z"
}
```

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/webhooks/` | List all webhooks |
| POST | `/webhooks/` | Create webhook |
| GET | `/webhooks/{id}/` | Get specific webhook |
| PUT | `/webhooks/{id}/` | Update webhook |
| DELETE | `/webhooks/{id}/` | Delete webhook |
| POST | `/webhooks/{id}/test/` | Test webhook |

**Webhook Creation:**
```json
{
  "url": "https://example.com/webhook",
  "event_types": ["product.created", "product.updated"],
  "is_enabled": true
}
```

**Available Event Types:**
- `product.created`
- `product.updated` 
- `product.deleted`

**Webhook Payload Format:**
```json
{
  "event_type": "product.created",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "id": 1,
    "sku": "SKU001",
    "name": "Product Name",
    "description": "Product description",
    "price": 29.99,
    "is_active": true
  }
}
```

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Get dashboard statistics |

**Response:**
```json
{
  "total_products": 450,
  "active_products": 420,
  "recent_imports": 12,
  "configured_webhooks": 3,
  "total_events_sent": 2845,
  "failed_events": 23
}
```

## Environment Variables

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DB_NAME=product_importer
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
REDIS_URL=redis://localhost:6379/0
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## Development

### Running Tests
```bash
python manage.py test
```

### Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Admin Interface
Access Django admin at: http://localhost:8000/admin/

### API Documentation
- Swagger UI: http://localhost:8000/api/docs/
- OpenAPI Schema: http://localhost:8000/api/schema/

## Deployment

### Heroku Deployment

1. **Install Heroku CLI and login**
```bash
heroku login
```

2. **Create Heroku app**
```bash
heroku create your-app-name
```

3. **Add PostgreSQL and Redis**
```bash
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini
```

4. **Set environment variables**
```bash
heroku config:set DEBUG=False
heroku config:set SECRET_KEY=your-production-secret-key
heroku config:set ALLOWED_HOSTS=your-app-name.herokuapp.com
heroku config:set CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

5. **Deploy**
```bash
git add .
git commit -m "Initial deployment"
git push heroku main
```

6. **Run migrations**
```bash
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
```

### Production Considerations

- Use environment variables for all sensitive settings
- Enable SSL/HTTPS
- Configure proper CORS origins
- Set up monitoring and logging
- Use a production WSGI server like Gunicorn
- Configure static file serving
- Set up database backups
- Monitor Celery workers

## License

MIT