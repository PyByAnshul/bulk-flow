'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Package, Upload, Webhook, BarChart3 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="h-4 bg-slate-200 rounded w-24 mb-4" />
            <div className="h-8 bg-slate-200 rounded w-32" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await dashboardApi.getStats();
      return response.data;
    },
  });

  if (isLoading) return <DashboardSkeleton />;



  const statusDistribution = [
    { name: 'Active', value: stats?.active_products || 0 },
    { name: 'Inactive', value: (stats?.total_products || 0) - (stats?.active_products || 0) },
  ];



  const COLORS = ['#3b82f6', '#ef4444'];
  const EVENT_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Overview of your product imports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Products</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {stats?.total_products || 0}
              </p>
            </div>
            <Package className="text-blue-500" size={32} />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm">Active Products</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {stats?.active_products || 0}
              </p>
            </div>
            <BarChart3 className="text-green-500" size={32} />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-purple-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm">Recent Imports</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {stats?.recent_imports || 0}
              </p>
            </div>
            <Upload className="text-purple-500" size={32} />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-orange-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm">Webhooks Configured</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {stats?.configured_webhooks || 0}
              </p>
            </div>
            <Webhook className="text-orange-500" size={32} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">


        {/* Status Distribution Pie Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Product Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>



        {/* Webhook Events */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Webhook Events</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Events Sent</span>
              <span className="font-bold text-2xl">{stats?.total_events_sent || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Failed Events</span>
              <span className="font-bold text-2xl text-red-600">{stats?.failed_events || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="flex gap-4 flex-wrap">
          <Button asChild>
            <Link href="/upload">Upload CSV</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">Manage Products</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/webhooks">Configure Webhooks</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
