'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { parseRepoInput } from '@/lib/parse-repo';
import { QUICK_PICKS } from '@/lib/examples';
import { Button } from '@/components/ui/button';
import { useT } from '@/components/i18n/language-provider';

interface RepoInputProps {
  size?: 'lg' | 'sm';
  autoFocus?: boolean;
  showQuickPicks?: boolean;
  defaultValue?: string;
  className?: string;
}

export function RepoInput({
  size = 'lg',
  autoFocus,
  showQuickPicks,
  defaultValue = '',
  className,
}: RepoInputProps) {
  const router = useRouter();
  const t = useT();
  const [value, setValue] = React.useState(defaultValue);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  function go(raw: string) {
    const ref = parseRepoInput(raw);
    if (!ref) {
      setError(t.input.error);
      return;
    }
    setError(null);
    startTransition(() => {
      router.push(`/analyze?repo=${ref.owner}/${ref.repo}`);
    });
  }

  const large = size === 'lg';

  return (
    <div className={cn('w-full', className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(value);
        }}
        className={cn(
          'group relative flex items-center gap-2 rounded-xl border border-input bg-card/60 p-2 shadow-codex backdrop-blur transition-colors focus-within:border-gold/70',
          large ? 'sm:gap-3 sm:p-2.5' : 'p-1.5',
        )}
      >
        <Search
          className={cn(
            'ml-2 shrink-0 text-muted-foreground transition-colors group-focus-within:text-gold',
            large ? 'h-5 w-5' : 'h-4 w-4',
          )}
        />
        <input
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          spellCheck={false}
          autoComplete="off"
          aria-label={t.a11y.repoUrl}
          placeholder={t.input.placeholder}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/60',
            large ? 'text-base sm:text-lg' : 'text-sm',
          )}
        />
        <Button
          type="submit"
          variant="default"
          size={large ? 'lg' : 'default'}
          disabled={pending}
          className="shrink-0"
        >
          {pending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <span className="hidden sm:inline">{t.input.cta}</span>
              <span className="sm:hidden">{t.input.ctaShort}</span>
              <ArrowRight />
            </>
          )}
        </Button>
      </form>

      <div className="mt-2 flex min-h-5 items-center gap-2 px-2">
        {error ? (
          <p className="font-mono text-xs text-oxblood">{error}</p>
        ) : (
          <p className="font-mono text-xs text-muted-foreground/70">
            {t.input.hint}
          </p>
        )}
      </div>

      {showQuickPicks && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-1">{t.input.try}</span>
          {QUICK_PICKS.map((slug) => (
            <button
              key={slug}
              type="button"
              onClick={() => {
                setValue(slug);
                go(slug);
              }}
              className="rounded-full border border-border bg-card/50 px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold"
            >
              {slug}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
