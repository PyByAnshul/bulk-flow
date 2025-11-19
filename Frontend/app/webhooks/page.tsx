'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { webhookApi } from '@/lib/api';
import { Webhook } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Event Types</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading webhooks...
                </TableCell>
              </TableRow>
            ) : !webhooks?.data?.length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div>
                    <p className="text-slate-600 mb-4">No webhooks configured yet</p>
                    <Button onClick={() => setIsModalOpen(true)}>Create First Webhook</Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              webhooks.data.map((webhook: Webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell className="font-mono text-sm max-w-xs">
                    <div className="truncate" title={webhook.url}>
                      {webhook.url}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {webhook.event_types.map((event) => (
                        <Badge key={event} variant="secondary" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        webhook.is_enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {webhook.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(webhook.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <WebhookModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        webhook={selectedWebhook}
      />
    </div>
  );
}
