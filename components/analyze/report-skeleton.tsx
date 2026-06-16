'use client';

import { Loader2 } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/components/i18n/language-provider';

export function ReportSkeleton({ slug }: { slug?: string }) {
  const t = useT();
  return (
    <div className="space-y-8" aria-busy="true">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-gold" />
        <span className="font-mono">
          {t.analyze.loadingPrefix}{' '}
          <span className="text-foreground">{slug ?? '…'}</span>…
        </span>
      </div>

      {/* overview */}
      <div className="rounded-xl border border-border bg-card/60 p-7">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="mt-6 h-4 w-3/4" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>

      {/* DNA + timeline */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-border bg-card/60 p-7">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded" />
          ))}
        </div>
        <div className="space-y-4 rounded-xl border border-border bg-card/60 p-7">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded" />
          ))}
        </div>
      </div>

      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
