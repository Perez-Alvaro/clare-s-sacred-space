import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface CatalogCardSkeletonProps {
  count?: number;
  className?: string;
  gridClassName?: string;
}

export const CatalogCardItemSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    role="status"
    aria-busy="true"
    aria-label="Cargando producto del catálogo"
    className={cn('clare-card flex flex-col h-full shadow-warm-sm', className)}
  >
    <Skeleton className="aspect-square w-full rounded-lg mb-4" />
    <div className="mt-auto space-y-2">
      <Skeleton className="h-5 w-3/4 rounded" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-4 w-1/3 rounded" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
    </div>
  </div>
);

export const CatalogCardSkeleton: React.FC<CatalogCardSkeletonProps> = ({
  count = 6,
  className,
  gridClassName = 'clare-grid',
}) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando catálogo de creaciones"
      className={cn(gridClassName)}
    >
      <span className="sr-only">Cargando creaciones de la tienda...</span>
      {Array.from({ length: count }).map((_, i) => (
        <CatalogCardItemSkeleton key={i} className={className} />
      ))}
    </div>
  );
};

export default CatalogCardSkeleton;
