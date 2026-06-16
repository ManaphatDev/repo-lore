'use client';

import * as React from 'react';
import { Check, Copy, Code2 } from 'lucide-react';

import { useT } from '@/components/i18n/language-provider';

export function EmbedBadge({ slug }: { slug: string }) {
  const t = useT();
  const [origin, setOrigin] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const badgeUrl = `${origin}/api/badge?repo=${slug}`;
  const reportUrl = `${origin}/analyze?repo=${slug}`;
  const markdown = `[![Repo Lore](${badgeUrl})](${reportUrl})`;

  function copy() {
    void navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="rounded-xl border border-border/70 bg-muted/30 p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Code2 className="h-4 w-4" />
        <span className="eyebrow">{t.embed.eyebrow}</span>
      </div>
      <p className="mt-1.5 font-display text-lg font-medium tracking-tight">
        {t.embed.title}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{t.embed.subtitle}</p>

      <div className="mt-3 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/badge?repo=${slug}`} alt="Repo Lore badge" height={20} />
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-card/60 px-3 py-2 font-mono text-xs text-muted-foreground">
          {markdown || '…'}
        </code>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-card/50 px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:border-gold/40 hover:text-foreground"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-verdigris" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? t.embed.copied : t.embed.copy}
        </button>
      </div>
    </div>
  );
}
