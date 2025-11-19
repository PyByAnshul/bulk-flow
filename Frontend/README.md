# Product Importer Admin Dashboard

A comprehensive admin dashboard application for managing product imports, viewing analytics, and managing webhooks.

## Features

- **Product Management**: Create, read, update, and delete products with CSV bulk import
- **Multiple Views**: List, Kanban, and detailed form views for products
- **Analytics Dashboard**: Real-time charts and statistics
- **Webhook Management**: Configure and manage webhooks for product events
- **CSV Upload**: Bulk import products with progress tracking
- **Search & Filter**: Advanced filtering and search capabilities

## Project Structure

\`\`\`
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Dashboard with charts
│   ├── products/
│   │   └── page.tsx        # Products management (list, kanban views)
│   ├── upload/
│   │   └── page.tsx        # CSV upload page
│   └── webhooks/
│       └── page.tsx        # Webhook management
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── providers.tsx       # React Query provider
│   ├── sidebar.tsx         # Navigation sidebar
│   └── product-modal.tsx   # Product form modal
├── lib/
│   ├── api.ts             # API client and endpoints
│   ├── types.ts           # TypeScript type definitions
│   └── validations.ts     # Zod validation schemas
└── public/                # Static assets
\`\`\`

## API Endpoints

### Base URL
\`\`\`
http://localhost:8000/api
\`\`\`
or via environment variable: `NEXT_PUBLIC_API_URL`

### Products

#### Get All Products
\`\`\`
GET /api/products?page=1&page_size=50&sku=SKU001&name=Product&is_active=true
\`\`\`

**Query Parameters:**
- `page` (optional): Page number, default 1
- `page_size` (optional): Items per page, default 50
- `sku` (optional): Filter by product SKU
- `name` (optional): Filter by product name
- `is_active` (optional): Filter by active status (true/false)

**Response:**
\`\`\`json
{
  "data": [
    {
      "id": 1,
      "sku": "SKU001",
      "name": "Product Name",
      "description": "Product description",
      "price": 29.99,
      "image_url": "https://example.com/image.jpg",
      "is_active": true,
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ],
  "page": 1,
  "page_size": 50,
  "total": 150
}
\`\`\`

#### Get Single Product
\`\`\`
GET /api/products/{id}
\`\`\`

**Response:**
\`\`\`json
{
  "data": {
    "id": 1,
    "sku": "SKU001",
    "name": "Product Name",
    "description": "Product description",
    "price": 29.99,
    "image_url": "https://example.com/image.jpg",
    "is_active": true,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
\`\`\`

#### Create Product
\`\`\`
POST /api/products
Content-Type: application/json
\`\`\`

**Request Body:**
\`\`\`json
{
  "sku": "SKU001",
  "name": "Product Name",
  "description": "Product description",
  "price": 29.99,
  "image_url": "https://example.com/image.jpg",
  "is_active": true
}
\`\`\`

**Response:** 201 Created
\`\`\`json
{
  "data": {
    "id": 1,
    "sku": "SKU001",
    "name": "Product Name",
    "description": "Product description",
    "price": 29.99,
    "image_url": "https://example.com/image.jpg",
    "is_active": true,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
\`\`\`

#### Update Product
\`\`\`
PUT /api/products/{id}
Content-Type: application/json
\`\`\`

**Request Body:**
\`\`\`json
{
  "sku": "SKU001",
  "name": "Updated Product Name",
  "description": "Updated description",
  "price": 39.99,
  "image_url": "https://example.com/image.jpg",
  "is_active": true
}
\`\`\`

**Response:** 200 OK
\`\`\`json
{
  "data": {
    "id": 1,
    "sku": "SKU001",
    "name": "Updated Product Name",
    "description": "Updated description",
    "price": 39.99,
    "image_url": "https://example.com/image.jpg",
    "is_active": true,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T11:00:00Z"
  }
}
\`\`\`

#### Delete Product
\`\`\`
DELETE /api/products/{id}
\`\`\`

**Response:** 204 No Content

#### Bulk Delete All Products
\`\`\`
DELETE /api/products/bulk-delete
\`\`\`

**Response:** 200 OK
\`\`\`json
{
  "message": "All products deleted successfully",
  "deleted_count": 150
}
\`\`\`

### File Upload

#### Upload CSV
\`\`\`
POST /api/upload
Content-Type: multipart/form-data
\`\`\`

**Request:**
- Form field: `file` (CSV file)

**CSV Format:**
\`\`\`
sku,name,description,price,image_url,is_active
SKU001,Product 1,Description 1,29.99,https://example.com/img1.jpg,true
SKU002,Product 2,Description 2,49.99,https://example.com/img2.jpg,true
\`\`\`

**Response:** 200 OK
\`\`\`json
{
  "data": {
    "job_id": "uuid-1234-5678",
    "status": "processing",
    "file_name": "products.csv",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
\`\`\`

#### Get Job Status
\`\`\`
GET /api/jobs/{jobId}
\`\`\`

**Response:**
\`\`\`json
{
  "data": {
    "job_id": "uuid-1234-5678",
    "status": "completed",
    "file_name": "products.csv",
    "total_rows": 100,
    "processed_rows": 100,
    "failed_rows": 0,
    "progress_percentage": 100,
    "created_at": "2025-01-15T10:30:00Z",
    "completed_at": "2025-01-15T10:35:00Z"
  }
}
\`\`\`

**Status Values:** `pending`, `processing`, `completed`, `failed`

### Webhooks

#### Get All Webhooks
\`\`\`
GET /api/webhooks
\`\`\`

**Response:**
\`\`\`json
{
  "data": [
    {
      "id": 1,
      "url": "https://example.com/webhooks/products",
      "event_types": ["product.created", "product.updated", "product.deleted"],
      "is_enabled": true,
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ]
}
\`\`\`

#### Create Webhook
\`\`\`
POST /api/webhooks
Content-Type: application/json
\`\`\`

**Request Body:**
\`\`\`json
{
  "url": "https://example.com/webhooks/products",
  "event_types": ["product.created", "product.updated"],
  "is_enabled": true
}
\`\`\`

**Response:** 201 Created
\`\`\`json
{
  "data": {
    "id": 1,
    "url": "https://example.com/webhooks/products",
    "event_types": ["product.created", "product.updated"],
    "is_enabled": true,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
\`\`\`

#### Update Webhook
\`\`\`
PUT /api/webhooks/{id}
Content-Type: application/json
\`\`\`

**Request Body:**
\`\`\`json
{
  "url": "https://example.com/webhooks/products-updated",
  "event_types": ["product.created", "product.updated", "product.deleted"],
  "is_enabled": true
}
\`\`\`

**Response:** 200 OK
\`\`\`json
{
  "data": {
    "id": 1,
    "url": "https://example.com/webhooks/products-updated",
    "event_types": ["product.created", "product.updated", "product.deleted"],
    "is_enabled": true,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:45:00Z"
  }
}
\`\`\`

#### Delete Webhook
\`\`\`
DELETE /api/webhooks/{id}
\`\`\`

**Response:** 204 No Content

#### Test Webhook
\`\`\`
POST /api/webhooks/{id}/test
\`\`\`

**Response:** 200 OK
\`\`\`json
{
  "message": "Test webhook sent successfully"
}
\`\`\`

### Dashboard

#### Get Dashboard Statistics
\`\`\`
GET /api/dashboard/stats
\`\`\`

**Response:**
\`\`\`json
{
  "data": {
    "total_products": 450,
    "active_products": 420,
    "recent_imports": 12,
    "configured_webhooks": 3,
    "total_events_sent": 2845,
    "failed_events": 23
  }
}
\`\`\`

## Available Event Types

Webhooks can be configured to listen to the following events:
- `product.created` - Triggered when a new product is created
- `product.updated` - Triggered when a product is updated
- `product.deleted` - Triggered when a product is deleted
- `import.started` - Triggered when a bulk import starts
- `import.completed` - Triggered when a bulk import completes
- `import.failed` - Triggered when a bulk import fails

## Webhook Payload Format

All webhook payloads follow this format:

\`\`\`json
{
  "event_type": "product.created",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "id": 1,
    "sku": "SKU001",
    "name": "Product Name",
    "description": "Product description",
    "price": 29.99,
    "image_url": "https://example.com/image.jpg",
    "is_active": true
  }
}
\`\`\`

## Error Responses

All API errors follow this format:

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "price",
        "message": "Price must be greater than 0"
      }
    ]
  }
}
\`\`\`

**Common Error Codes:**
- `VALIDATION_ERROR` (400) - Invalid request data
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Duplicate SKU or resource already exists
- `INTERNAL_ERROR` (500) - Server error

## Environment Variables

\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:8000
\`\`\`

Set this to your backend API URL. Defaults to `http://localhost:8000` if not provided.

## Installation & Running

### Install dependencies
\`\`\`bash
npm install
# or
yarn install
\`\`\`

### Run development server
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Technologies Used

- **Next.js 16** - React framework
- **React 19** - UI library
- **React Query** - Data fetching and caching
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **TypeScript** - Type safety
- **Zod** - Schema validation
- **Axios** - HTTP client

## License

MIT
