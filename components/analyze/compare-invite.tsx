'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Swords } from 'lucide-react';

import { parseRepoInput } from '@/lib/parse-repo';
import { QUICK_PICKS } from '@/lib/examples';
import { getRecent } from '@/lib/recent';
import { Button } from '@/components/ui/button';
import { useT } from '@/components/i18n/language-provider';

export function CompareInvite({ repo }: { repo: string }) {
  const router = useRouter();
  const t = useT();
  const [value, setValue] = React.useState('');
  const [error, setError] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [chips, setChips] = React.useState<string[]>([]);

  React.useEffect(() => {
    const recent = getRecent();
    const combined = [
      ...QUICK_PICKS,
      ...recent.filter((r) => !QUICK_PICKS.includes(r)),
    ]
      .filter((r) => r.toLowerCase() !== repo.toLowerCase())
      .slice(0, 5);
    setChips(combined);
  }, [repo]);

  function battle(opponent: string) {
    startTransition(() => {
      router.push(`/analyze?repo=${repo}&vs=${opponent}`);
    });
  }

  function go(e: React.FormEvent) {
    e.preventDefault();
    const ref = parseRepoInput(value);
    if (!ref) {
      setError(true);
      return;
    }
    setError(false);
    battle(`${ref.owner}/${ref.repo}`);
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
      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            {t.compare.or}:
          </span>
          {chips.map((slug) => (
            <button
              key={slug}
              type="button"
              disabled={pending}
              onClick={() => battle(slug)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card/50 px-2.5 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:border-gold/40 hover:text-foreground disabled:opacity-40"
            >
              <Swords className="h-3 w-3" />
              {slug}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
