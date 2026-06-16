'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Swords } from 'lucide-react';

import { parseRepoInput } from '@/lib/parse-repo';
import { Button } from '@/components/ui/button';
import { useT } from '@/components/i18n/language-provider';

export function CompareInvite({ repo }: { repo: string }) {
  const router = useRouter();
  const t = useT();
  const [value, setValue] = React.useState('');
  const [error, setError] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  function go(e: React.FormEvent) {
    e.preventDefault();
    const ref = parseRepoInput(value);
    if (!ref) {
      setError(true);
      return;
    }
    setError(false);
    startTransition(() => {
      router.push(`/analyze?repo=${repo}&vs=${ref.owner}/${ref.repo}`);
    });
  }

  return (
    <div className="rounded-xl border border-border/70 bg-muted/30 p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Swords className="h-4 w-4" />
        <span className="eyebrow">{t.compare.eyebrow}</span>
      </div>
      <p className="mt-1.5 font-display text-lg font-medium tracking-tight">
        {t.compare.title}
      </p>
      <form onSubmit={go} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(false);
          }}
          spellCheck={false}
          autoComplete="off"
          aria-label={t.compare.placeholder}
          placeholder={t.compare.placeholder}
          className="min-w-0 flex-1 rounded-lg border border-input bg-card/60 px-3 py-2 text-sm outline-none transition-colors focus:border-gold/70"
        />
        <Button type="submit" disabled={pending} className="shrink-0">
          {pending ? <Loader2 className="animate-spin" /> : <Swords />}
          {t.compare.cta}
        </Button>
      </form>
      {error && (
        <p className="mt-2 font-mono text-xs text-oxblood">{t.compare.error}</p>
      )}
    </div>
  );
}
