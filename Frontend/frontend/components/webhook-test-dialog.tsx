'use client';

import { useState } from 'react';
import { webhookApi } from '@/lib/api';
import { Webhook, WebhookTestResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WebhookTestDialogProps {
  webhook: Webhook;
}

export default function WebhookTestDialog({ webhook }: WebhookTestDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WebhookTestResponse | null>(null);
  const { toast } = useToast();

  const handleTest = async () => {
    setIsLoading(true);
    try {
      const response = await webhookApi.testWebhook(webhook.id);
      setResult(response.data);
    } catch (error: any) {
      toast({
        title: 'Error testing webhook',
        description:
          error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Play size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Test Webhook</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm font-mono break-all text-slate-600">
              {webhook.url}
            </p>
          </div>

          {result && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-lg ${
                  result.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <p
                  className={`font-semibold ${
                    result.success ? 'text-green-900' : 'text-red-900'
                  }`}
                >
                  {result.success ? 'Success' : 'Failed'}
                </p>
                <p
                  className={`text-sm ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  Status: {result.status_code}
                </p>
                <p
                  className={`text-sm ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  Response time: {result.response_time}ms
                </p>
              </div>

              {result.response_body && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-slate-900 mb-2">
                    Response Body:
                  </p>
                  <pre className="text-xs overflow-auto max-h-48 text-slate-700">
                    {JSON.stringify(result.response_body, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleTest}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Webhook'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
