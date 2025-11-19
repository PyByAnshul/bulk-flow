'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormData } from '@/lib/validations';
import { productApi } from '@/lib/api';
import { Product } from '@/lib/types';
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

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSuccess,
  product,
}: ProductModalProps) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      price: 0,
      is_active: true,
    },
  });

  const isActive = watch('is_active');

  useEffect(() => {
    if (product) {
      setValue('sku', product.sku);
      setValue('name', product.name);
      setValue('description', product.description || '');
      setValue('price', product.price);
      setValue('is_active', product.is_active);
    } else {
      reset();
    }
  }, [product, setValue, reset]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (product) {
        await productApi.updateProduct(product.id, data);
        toast({ title: 'Product updated successfully' });
      } else {
        await productApi.createProduct(data);
        toast({ title: 'Product created successfully' });
      }
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error saving product',
        description:
          error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">SKU</label>
            <Input
              {...register('sku')}
              placeholder="e.g., PROD-001"
              disabled={isSubmitting}
            />
            {errors.sku && (
              <p className="text-red-500 text-sm mt-1">{errors.sku.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              {...register('name')}
              placeholder="Product name"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Input
              {...register('description')}
              placeholder="Optional description"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <Input
              {...register('price')}
              type="number"
              step="0.01"
              placeholder="0.00"
              disabled={isSubmitting}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) =>
                setValue('is_active', checked as boolean)
              }
              disabled={isSubmitting}
            />
            <label htmlFor="is_active" className="text-sm font-medium">
              Active
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : product ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
