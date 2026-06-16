'use client';

import * as React from 'react';
import Link from 'next/link';
import { Clock, X } from 'lucide-react';

import { getRecent, clearRecent } from '@/lib/recent';
import { useT } from '@/components/i18n/language-provider';

export function RecentRepos() {
  const t = useT();
  const [items, setItems] = React.useState<string[]>([]);

  React.useEffect(() => setItems(getRecent()), []);

  if (items.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="eyebrow mr-1 inline-flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {t.recent.title}
      </span>
      {items.map((slug) => (
        <Link
          key={slug}
          href={`/analyze?repo=${slug}`}
          className="rounded-full border border-border bg-card/50 px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold"
        >
          {slug}
        </Link>
      ))}
      <button
        type="button"
        onClick={() => {
          clearRecent();
          setItems([]);
        }}
        aria-label={t.recent.clear}
        title={t.recent.clear}
        className="text-muted-foreground/50 transition-colors hover:text-oxblood"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
