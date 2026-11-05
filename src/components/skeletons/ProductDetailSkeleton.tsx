import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface ProductDetailSkeletonProps {
  className?: string;
}

export const ProductDetailSkeleton: React.FC<ProductDetailSkeletonProps> = ({
  className,
}) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando detalles de la creación"
      className={cn('clare-container', className)}
    >
      <span className="sr-only">Cargando producto y opciones...</span>

      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <Skeleton className="h-4 w-12 rounded" />
        <span className="text-slate-300">/</span>
        <Skeleton className="h-4 w-16 rounded" />
        <span className="text-slate-300">/</span>
        <Skeleton className="h-4 w-32 rounded" />
      </div>

      {/* Main Product Card */}
      <div className="bg-white rounded-2xl md:rounded-3xl overflow-hidden md:shadow-xl md:border border-slate-100 max-w-3xl mx-auto shadow-warm-md">
        {/* Gallery skeleton */}
        <div className="w-full">
          <Skeleton className="w-full aspect-square rounded-none" />
          <div className="flex gap-2 px-4 py-3 overflow-x-auto">
            <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
            <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
            <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
          </div>
        </div>

        {/* Info skeleton */}
        <div className="w-full p-5 md:p-10 flex flex-col space-y-6">
          <div className="pb-5 border-b border-sand/40 space-y-3">
            <Skeleton className="h-8 md:h-10 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded" />
            <div className="flex items-baseline gap-3 pt-2">
              <Skeleton className="h-9 w-36 rounded-lg" />
              <Skeleton className="h-5 w-20 rounded" />
            </div>
            <Skeleton className="h-3 w-48 rounded" />
          </div>

          {/* Variants skeleton */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-20 rounded-full" />
                <Skeleton className="h-9 w-24 rounded-full" />
                <Skeleton className="h-9 w-20 rounded-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-28 rounded-lg" />
                <Skeleton className="h-9 w-28 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Actions skeleton */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-12 sm:w-32 rounded-lg" />
            <Skeleton className="h-12 flex-1 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
