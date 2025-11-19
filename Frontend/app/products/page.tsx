'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/lib/api';
import { Product } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit2, Trash2, Plus } from 'lucide-react';
import ProductModal from '@/components/product-modal';
import DeleteDialog from '@/components/delete-dialog';
import { useToast } from '@/hooks/use-toast';



export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('sku');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['products', page, search, searchField, statusFilter],
    queryFn: async () => {
      const params: any = {
        page,
        page_size: 50,
      };
      if (search) params[searchField] = search;
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active';

      const response = await productApi.getProducts(params);
      return response.data;
    },
  });

  const handleDeleteProduct = async (id: number) => {
    try {
      await productApi.deleteProduct(id);
      toast({ title: 'Product deleted successfully' });
      setDeleteId(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error deleting product',
        description:
          error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await productApi.bulkDeleteAll();
      toast({ title: 'All products deleted successfully' });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error deleting products',
        description:
          error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleModalSuccess = () => {
    refetch();
    handleModalClose();
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-600 mt-2">
            Manage and view all your products
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus size={20} />
            Add Product
          </Button>
          {data?.count > 0 && (
            <DeleteDialog
              title="Delete All Products"
              description="Are you sure you want to delete all products? This action cannot be undone."
              onConfirm={handleBulkDelete}
              triggerText="Bulk Delete All"
              variant="destructive"
            />
          )}
        </div>
      </div>

      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex gap-2">
            <Select value={searchField} onValueChange={setSearchField}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sku">SKU</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="description">Description</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={`Search by ${searchField}...`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="flex-1"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

        </div>
      </Card>

      {/* Products Table */}
      {
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : data?.results?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                data?.results?.map((product: Product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-sm">
                      {product.sku}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-sm text-slate-600 max-w-xs truncate">
                      {product.description || '-'}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${Number(product.price).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(product)}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <DeleteDialog
                          title="Delete Product"
                          description={`Are you sure you want to delete "${product.name}"?`}
                          onConfirm={() => handleDeleteProduct(product.id)}
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

          <div className="flex items-center justify-between p-6 border-t">
            <span className="text-sm text-slate-600">
              Total: {data?.count || 0} products
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={!data?.previous}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm">Page {page}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!data?.next}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      }

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        product={selectedProduct}
      />
    </div>
  );
}
