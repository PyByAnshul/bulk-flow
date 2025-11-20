import { z } from 'zod';

export const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  is_active: z.boolean().default(true),
});

export const webhookSchema = z.object({
  url: z.string().url('Invalid URL format'),
  event_types: z.array(z.string()).min(1, 'Select at least one event type'),
  is_enabled: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type ProductFormInput = z.input<typeof productSchema>;
export type WebhookFormData = z.infer<typeof webhookSchema>;
export type WebhookFormInput = z.input<typeof webhookSchema>;
