'use client';

import { LANG_LABEL, LANGS } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';
import { useI18n } from './language-provider';

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-card/60 p-0.5 font-mono text-xs',
        className,
      )}
      role="group"
      aria-label={t.a11y.language}
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            'rounded-full px-2.5 py-1 transition-colors',
            lang === l
              ? 'bg-gold/15 text-gold'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {LANG_LABEL[l]}
        </button>
      ))}
    </div>
  );
}
