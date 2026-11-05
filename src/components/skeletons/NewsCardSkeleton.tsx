import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface NewsCardSkeletonProps {
  count?: number;
  className?: string;
  containerClassName?: string;
}

export const NewsCardItemSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <article
    role="status"
    aria-busy="true"
    aria-label="Cargando artículo de novedades"
    className={cn('clare-card shadow-warm-sm', className)}
  >
    <Skeleton className="w-full h-64 rounded-lg mb-6" />
    <Skeleton className="h-7 w-3/4 rounded mb-3" />
    <Skeleton className="h-4 w-28 rounded mb-4" />
    <div className="space-y-2 pt-2">
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-5/6 rounded" />
      <Skeleton className="h-4 w-4/6 rounded" />
    </div>
  </article>
);

export const NewsCardSkeleton: React.FC<NewsCardSkeletonProps> = ({
  count = 3,
  className,
  containerClassName = 'space-y-8 max-w-3xl mx-auto',
}) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando novedades"
      className={cn(containerClassName)}
    >
      <span className="sr-only">Cargando publicaciones y novedades...</span>
      {Array.from({ length: count }).map((_, i) => (
        <NewsCardItemSkeleton key={i} className={className} />
      ))}
    </div>
  );
};

export default NewsCardSkeleton;
