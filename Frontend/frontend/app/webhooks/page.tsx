'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { webhookApi } from '@/lib/api';
import { Webhook } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Plus, Play } from 'lucide-react';
import WebhookModal from '@/components/webhook-modal';
import DeleteDialog from '@/components/delete-dialog';
import WebhookTestDialog from '@/components/webhook-test-dialog';
import { useToast } from '@/hooks/use-toast';

export default function WebhooksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: webhooks, isLoading, refetch } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const response = await webhookApi.getWebhooks();
      return response.data;
    },
  });

  const handleDeleteWebhook = async (id: number) => {
    try {
      await webhookApi.deleteWebhook(id);
      toast({ title: 'Webhook deleted successfully' });
      setDeleteId(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error deleting webhook',
        description:
          error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedWebhook(null);
  };

  const handleModalSuccess = () => {
    refetch();
    handleModalClose();
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Webhooks</h1>
          <p className="text-slate-600 mt-2">
            Manage webhook endpoints for product events
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={20} />
          Add Webhook
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading webhooks...</div>
      ) : !webhooks?.length ? (
        <Card className="p-8 text-center">
          <p className="text-slate-600 mb-4">No webhooks configured yet</p>
          <Button onClick={() => setIsModalOpen(true)}>Create First Webhook</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {webhooks.map((webhook: Webhook) => (
            <Card
              key={webhook.id}
              className="p-6 flex items-start justify-between"
            >
              <div className="flex-1">
                <p className="font-mono text-sm break-all text-blue-600 mb-3">
                  {webhook.url}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {webhook.event_types.map((event) => (
                    <Badge key={event} variant="secondary">
                      {event}
                    </Badge>
                  ))}
                </div>
                <div className="mt-3">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      webhook.is_enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {webhook.is_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <WebhookTestDialog webhook={webhook} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditClick(webhook)}
                >
                  <Edit2 size={16} />
                </Button>
                <DeleteDialog
                  title="Delete Webhook"
                  description={`Are you sure you want to delete this webhook?`}
                  onConfirm={() => handleDeleteWebhook(webhook.id)}
                  variant="ghost"
                  size="sm"
                  triggerIcon={<Trash2 size={16} />}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <WebhookModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        webhook={selectedWebhook}
      />
    </div>
  );
}
