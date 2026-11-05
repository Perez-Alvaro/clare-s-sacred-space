import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface MetricCardSkeletonProps {
  count?: number;
  className?: string;
  gridClassName?: string;
}

export const MetricCardItemSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    role="status"
    aria-busy="true"
    aria-label="Cargando métrica"
    className={cn('clare-card flex items-center gap-4 shadow-warm-sm', className)}
  >
    <Skeleton className="w-12 h-12 rounded-full shrink-0" />
    <div className="flex-1 min-w-0 space-y-2">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-6 w-24" />
    </div>
  </div>
);

export const MetricCardSkeleton: React.FC<MetricCardSkeletonProps> = ({
  count = 4,
  className,
  gridClassName = 'grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8',
}) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando métricas del panel"
      className={cn(gridClassName)}
    >
      <span className="sr-only">Cargando métricas del panel de administración...</span>
      {Array.from({ length: count }).map((_, i) => (
        <MetricCardItemSkeleton key={i} className={className} />
      ))}
    </div>
  );
};

export default MetricCardSkeleton;
