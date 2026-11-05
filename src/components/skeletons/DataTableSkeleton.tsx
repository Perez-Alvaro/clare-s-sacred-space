import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface DataTableSkeletonProps {
  columns?: string[];
  columnCount?: number;
  rows?: number;
  hasImageThumbnail?: boolean;
  className?: string;
}

export const DataTableSkeleton: React.FC<DataTableSkeletonProps> = ({
  columns,
  columnCount = 5,
  rows = 5,
  hasImageThumbnail = false,
  className,
}) => {
  const effectiveColumnCount = columns?.length || columnCount;
  const colArray = columns || Array.from({ length: effectiveColumnCount }, (_, i) => `Columna ${i + 1}`);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando tabla de datos"
      className={cn('clare-card overflow-x-auto shadow-warm-sm', className)}
    >
      <span className="sr-only">Cargando datos de la tabla...</span>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '2px solid hsl(var(--sand))' }}>
            {colArray.map((colName, idx) => (
              <th
                key={idx}
                className={cn(
                  'py-2 font-medium',
                  idx === colArray.length - 1 ? 'text-right' : 'text-left'
                )}
                style={{ color: 'hsl(var(--earth))' }}
              >
                <div
                  className={cn(
                    'flex items-center gap-2',
                    idx === colArray.length - 1 ? 'justify-end' : 'justify-start'
                  )}
                >
                  <Skeleton className="h-4 w-20" />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rIdx) => (
            <tr
              key={rIdx}
              style={{ borderBottom: '1px solid hsl(var(--sand))' }}
              className="transition-colors"
            >
              {colArray.map((_, cIdx) => (
                <td
                  key={cIdx}
                  className={cn(
                    'py-3',
                    cIdx === colArray.length - 1 ? 'text-right' : 'text-left'
                  )}
                >
                  {cIdx === 0 && hasImageThumbnail ? (
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-md shrink-0" />
                      <div className="space-y-1.5 flex-1 max-w-[200px]">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ) : cIdx === colArray.length - 1 ? (
                    <div className="flex items-center justify-end gap-2">
                      <Skeleton className="h-7 w-7 rounded-md" />
                      <Skeleton className="h-7 w-7 rounded-md" />
                    </div>
                  ) : (
                    <Skeleton
                      className={cn(
                        'h-4',
                        cIdx % 2 === 0 ? 'w-24' : 'w-16'
                      )}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTableSkeleton;
