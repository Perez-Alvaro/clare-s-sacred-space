import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface FormCardSkeletonProps {
  fields?: number;
  hasTextarea?: boolean;
  maxWidth?: string;
  className?: string;
}

export const FormCardSkeleton: React.FC<FormCardSkeletonProps> = ({
  fields = 3,
  hasTextarea = true,
  maxWidth = 'max-w-2xl',
  className,
}) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando formulario"
      className={cn(
        'clare-card bg-white border border-slate-200 shadow-warm-sm',
        maxWidth,
        className
      )}
    >
      <span className="sr-only">Cargando formulario y configuraciones...</span>
      {/* Title & subtitle */}
      <div className="space-y-2 mb-6">
        <Skeleton className="h-6 w-52 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
      </div>

      {/* Dynamic input fields */}
      <div className="space-y-4 mb-6">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}

        {hasTextarea && (
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        )}
      </div>

      {/* Button placeholder */}
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
    </div>
  );
};

export default FormCardSkeleton;
