export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

// Job/Upload types
export interface UploadJob {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  processed_rows: number;
  total_rows: number;
  errors: string[];
}

// Webhook types
export interface Webhook {
  id: number;
  url: string;
  event_types: string[];
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookTestResponse {
  status_code: number;
  response_time: number;
  response_body: any;
  success: boolean;
}

// Dashboard types
export interface DashboardStats {
  total_products: number;
  active_products: number;
  recent_imports: number;
  configured_webhooks: number;
}
