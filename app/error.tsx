'use client';

import { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useT } from '@/components/i18n/language-provider';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();

  useEffect(() => {
    // Surface the error for observability; no data is persisted.
    console.error(error);
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-mono text-sm uppercase tracking-[0.3em] text-oxblood">
        {t.errorPage.eyebrow}
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
        {t.errorPage.title}
      </h1>
      <p className="mt-3 max-w-md text-pretty text-muted-foreground">
        {t.errorPage.body}
      </p>
      <Button onClick={reset} variant="foil" className="mt-8">
        <RotateCcw className="h-4 w-4" />
        {t.errorPage.retry}
      </Button>
    </div>
  );
}
