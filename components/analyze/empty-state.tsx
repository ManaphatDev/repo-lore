'use client';

import { RepoInput } from '@/components/repo-input';
import { RecentRepos } from '@/components/recent-repos';
import { useT } from '@/components/i18n/language-provider';

export function EmptyState() {
  const t = useT();
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-20 text-center">
      <span className="eyebrow">{t.analyze.emptyEyebrow}</span>
      <h1 className="mt-3 text-balance font-display text-4xl font-semibold tracking-tight">
        {t.analyze.emptyTitle}
      </h1>
      <p className="mt-3 text-pretty text-muted-foreground">
        {t.analyze.emptySubtitle}
      </p>
      <div className="mt-8 w-full">
        <RepoInput size="lg" autoFocus showQuickPicks />
        <RecentRepos />
      </div>
    </div>
  );
}
