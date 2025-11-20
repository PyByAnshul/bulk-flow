'use client';

import { useState, useCallback } from 'react';
import { uploadApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<
    'idle' | 'uploading' | 'parsing' | 'importing' | 'completed' | 'failed'
  >('idle');
  const [progress, setProgress] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a CSV file',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
      setStatus('idle');
    }
  };

  const handleDragDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile?.name.endsWith('.csv')) {
      setFile(droppedFile);
      setStatus('idle');
    }
  };

  const handleUpload = useCallback(async () => {
    if (!file) return;

    try {
      setStatus('uploading');
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await uploadApi.uploadFile(formData);
      const newJobId = uploadResponse.data.job_id;
      setJobId(newJobId);

      // Start polling for progress
      setStatus('parsing');
      pollProgress(newJobId);
    } catch (error: any) {
      setStatus('failed');
      const errorMessage =
        error.response?.data?.message || 'Upload failed. Please try again.';
      setErrors([errorMessage]);
      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [file, toast]);

  const pollProgress = useCallback(async (jId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await uploadApi.getJobStatus(jId);
        const jobData = response.data;

        setProgress(jobData.progress);
        setProcessedRows(jobData.processed_rows);
        setTotalRows(jobData.total_rows);

        if (jobData.status === 'processing') {
          setStatus('importing');
        } else if (jobData.status === 'completed') {
          setStatus('completed');
          clearInterval(pollInterval);
          toast({
            title: 'Upload completed',
            description: `Successfully imported ${jobData.processed_rows} products`,
          });
        } else if (jobData.status === 'failed') {
          setStatus('failed');
          setErrors(jobData.errors);
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Poll error:', error);
        clearInterval(pollInterval);
      }
    }, 2000);
  }, [toast]);

  const handleRetry = () => {
    setFile(null);
    setJobId(null);
    setStatus('idle');
    setProgress(0);
    setProcessedRows(0);
    setTotalRows(0);
    setErrors([]);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Upload CSV</h1>
        <p className="text-slate-600 mt-2">Import products from a CSV file</p>
      </div>

      <Card className="p-8 max-w-2xl">
        {!file ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDragDrop}
            className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition"
          >
            <Upload className="mx-auto mb-4 text-slate-400" size={48} />
            <p className="text-lg font-semibold text-slate-900 mb-2">
              Drag and drop your CSV file here
            </p>
            <p className="text-slate-600 mb-6">or click to browse</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button asChild className="cursor-pointer">
                <span>Select File</span>
              </Button>
            </label>
            <p className="text-sm text-slate-500 mt-4">
              Maximum 500,000 records per file
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-semibold text-slate-900">{file.name}</p>
                <p className="text-sm text-slate-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {status === 'completed' && (
                <CheckCircle className="text-green-500" size={24} />
              )}
              {status === 'failed' && (
                <AlertCircle className="text-red-500" size={24} />
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    {status === 'uploading'
                      ? 'Uploading...'
                      : status === 'parsing'
                        ? 'Parsing CSV...'
                        : status === 'importing'
                          ? 'Importing products...'
                          : status === 'completed'
                            ? 'Complete!'
                            : 'Failed'}
                  </span>
                  <span className="text-sm font-medium text-slate-700">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {totalRows > 0 && (
                <p className="text-sm text-slate-600">
                  Processing: {processedRows.toLocaleString()} /{' '}
                  {totalRows.toLocaleString()}
                </p>
              )}
            </div>

            {status === 'failed' && errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-semibold text-red-900 mb-2">
                  Errors occurred:
                </p>
                <ul className="space-y-1">
                  {errors.map((error, i) => (
                    <li key={i} className="text-sm text-red-800">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4">
              {status === 'idle' && (
                <Button onClick={handleUpload} className="flex-1">
                  Upload File
                </Button>
              )}

              {(status === 'failed' || status === 'completed') && (
                <>
                  <Button onClick={handleRetry} variant="outline" className="flex-1">
                    Upload Another File
                  </Button>
                  {status === 'completed' && (
                    <Button asChild className="flex-1">
                      <Link href="/products">View Products</Link>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
