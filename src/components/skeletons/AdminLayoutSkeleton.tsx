import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface AdminLayoutSkeletonProps {
  className?: string;
}

export const AdminLayoutSkeleton: React.FC<AdminLayoutSkeletonProps> = ({ className }) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando panel de administración"
      className={cn('min-h-screen flex', className)}
      style={{ backgroundColor: 'hsl(var(--cream))' }}
    >
      <span className="sr-only">Cargando panel de administración...</span>

      {/* Simulated Sidebar */}
      <aside
        className="hidden md:flex flex-col w-64 p-6 justify-between shrink-0"
        style={{ backgroundColor: 'hsl(var(--earth))' }}
      >
        <div>
          <div className="mb-6">
            <span
              className="text-2xl font-semibold block text-white/90"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              CLARE
            </span>
            <p className="text-xs text-sand/70">Panel de administración</p>
          </div>

          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5">
                <Skeleton className="w-5 h-5 rounded bg-white/20" />
                <Skeleton className="h-4 w-28 bg-white/20" />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg">
            <Skeleton className="w-5 h-5 rounded bg-white/20" />
            <Skeleton className="h-4 w-24 bg-white/20" />
          </div>
        </div>
      </aside>

      {/* Simulated Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header
          className="h-16 px-6 flex items-center justify-between border-b"
          style={{
            backgroundColor: 'hsla(var(--cream), 0.95)',
            borderColor: 'hsl(var(--sand))',
          }}
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-14" />
            <span className="text-slate-400 text-xs">/</span>
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </header>

        {/* Content body */}
        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-44 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="clare-card flex items-center gap-4 shadow-warm-sm">
                <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>

          <div className="clare-card shadow-warm-sm p-6 space-y-4">
            <Skeleton className="h-5 w-48" />
            <div className="space-y-3 pt-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayoutSkeleton;
