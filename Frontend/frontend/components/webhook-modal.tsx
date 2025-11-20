'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { webhookSchema, type WebhookFormData, type WebhookFormInput } from '@/lib/validations';
import { webhookApi } from '@/lib/api';
import { Webhook } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface WebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  webhook?: Webhook | null;
}

const EVENT_TYPES = [
  { value: 'product.created', label: 'Product Created' },
  { value: 'product.updated', label: 'Product Updated' },
  { value: 'product.deleted', label: 'Product Deleted' },
];

export default function WebhookModal({
  isOpen,
  onClose,
  onSuccess,
  webhook,
}: WebhookModalProps) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<WebhookFormInput>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      url: '',
      event_types: [],
      is_enabled: true,
    },
  });

  const selectedEvents = watch('event_types');
  const isEnabled = watch('is_enabled');

  useEffect(() => {
    if (webhook) {
      setValue('url', webhook.url);
      setValue('event_types', webhook.event_types);
      setValue('is_enabled', webhook.is_enabled);
    } else {
      reset();
    }
  }, [webhook, setValue, reset]);

  const onSubmit = async (data: WebhookFormInput) => {
    try {
      if (webhook) {
        await webhookApi.updateWebhook(webhook.id, {
          ...data,
          is_enabled: data.is_enabled ?? true,
        });
        toast({ title: 'Webhook updated successfully' });
      } else {
        await webhookApi.createWebhook({
          ...data,
          is_enabled: data.is_enabled ?? true,
        });
        toast({ title: 'Webhook created successfully' });
      }
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error saving webhook',
        description:
          error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleEventToggle = (eventType: string) => {
    const current = selectedEvents || [];
    const updated = current.includes(eventType)
      ? current.filter((e) => e !== eventType)
      : [...current, eventType];
    setValue('event_types', updated);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {webhook ? 'Edit Webhook' : 'Add New Webhook'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">URL</label>
            <Input
              {...register('url')}
              placeholder="https://example.com/webhook"
              disabled={isSubmitting}
            />
            {errors.url && (
              <p className="text-red-500 text-sm mt-1">{errors.url.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              Event Types
            </label>
            <div className="space-y-2">
              {EVENT_TYPES.map((event) => (
                <div key={event.value} className="flex items-center gap-2">
                  <Checkbox
                    id={event.value}
                    checked={selectedEvents?.includes(event.value)}
                    onCheckedChange={() => handleEventToggle(event.value)}
                    disabled={isSubmitting}
                  />
                  <label htmlFor={event.value} className="text-sm">
                    {event.label}
                  </label>
                </div>
              ))}
            </div>
            {errors.event_types && (
              <p className="text-red-500 text-sm mt-1">
                {errors.event_types.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="is_enabled"
              checked={isEnabled}
              onCheckedChange={(checked) =>
                setValue('is_enabled', checked as boolean)
              }
              disabled={isSubmitting}
            />
            <label htmlFor="is_enabled" className="text-sm font-medium">
              Enabled
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : webhook ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
