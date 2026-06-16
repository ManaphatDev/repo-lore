'use client';

import Link from 'next/link';
import {
  Ban,
  Clock,
  Frown,
  Link2Off,
  ServerCrash,
  WifiOff,
  type LucideIcon,
} from 'lucide-react';

import type { AnalyzeError } from '@/types';
import { RepoInput } from '@/components/repo-input';
import { buttonVariants } from '@/components/ui/button';
import { useT } from '@/components/i18n/language-provider';

const ICONS: Record<AnalyzeError['code'], LucideIcon> = {
  invalid_url: Link2Off,
  not_found: Frown,
  rate_limited: Clock,
  empty_repository: Ban,
  network_error: WifiOff,
  server_error: ServerCrash,
};

export function AnalysisError({
  error,
  repo,
}: {
  error: AnalyzeError;
  repo: string;
}) {
  const t = useT();
  const Icon = ICONS[error.code] ?? ServerCrash;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-oxblood/30 bg-oxblood/10 text-oxblood">
        <Icon className="h-7 w-7" />
      </div>

      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
        {t.analyze.errors[error.code] ?? t.analyze.errors.server_error}
      </h1>

      <p className="mt-3 text-pretty text-muted-foreground">{error.message}</p>

      {error.hint && (
        <p className="mt-2 max-w-md text-pretty text-sm text-muted-foreground/80">
          {error.hint}
        </p>
      )}

      {repo && (
        <p className="mt-4 font-mono text-xs text-muted-foreground/60">
          {t.analyze.youTried} {repo}
        </p>
      )}

      <div className="mt-8 w-full">
        <RepoInput
          size="lg"
          defaultValue={error.code === 'invalid_url' ? repo : ''}
        />
      </div>

      <Link
        href="/"
        className={buttonVariants({
          variant: 'ghost',
          size: 'sm',
          className: 'mt-4',
        })}
      >
        {t.analyze.back}
      </Link>
    </div>
  );
}
