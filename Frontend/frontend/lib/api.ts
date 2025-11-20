import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Product endpoints
export const productApi = {
  getProducts: (params?: {
    page?: number;
    page_size?: number;
    sku?: string;
    name?: string;
    is_active?: boolean;
  }) => api.get('/api/products', { params }),
  getProduct: (id: number) => api.get(`/api/products/${id}`),
  createProduct: (data: {
    sku: string;
    name: string;
    description?: string;
    price: number;
    is_active: boolean;
  }) => api.post('/api/products', data),
  updateProduct: (
    id: number,
    data: {
      sku: string;
      name: string;
      description?: string;
      price: number;
      is_active: boolean;
    }
  ) => api.put(`/api/products/${id}`, data),
  deleteProduct: (id: number) => api.delete(`/api/products/${id}`),
  bulkDeleteAll: () => api.delete('/api/products/bulk-delete'),
};

// Upload endpoints
export const uploadApi = {
  uploadFile: (formData: FormData) =>
    api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getJobStatus: (jobId: string) => api.get(`/api/jobs/${jobId}`),
};

// Webhook endpoints
export const webhookApi = {
  getWebhooks: () => api.get('/api/webhooks'),
  createWebhook: (data: {
    url: string;
    event_types: string[];
    is_enabled: boolean;
  }) => api.post('/api/webhooks', data),
  updateWebhook: (
    id: number,
    data: {
      url: string;
      event_types: string[];
      is_enabled: boolean;
    }
  ) => api.put(`/api/webhooks/${id}`, data),
  deleteWebhook: (id: number) => api.delete(`/api/webhooks/${id}`),
  testWebhook: (id: number) => api.post(`/api/webhooks/${id}/test`),
};

// Dashboard endpoints
export const dashboardApi = {
  getStats: () => api.get('/api/dashboard/stats'),
};
