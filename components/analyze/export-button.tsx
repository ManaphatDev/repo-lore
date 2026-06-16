'use client';

import { Download } from 'lucide-react';

import type { Lore, RepoAnalysis } from '@/types/analysis';
import { buildReportMarkdown } from '@/lib/report-markdown';
import { useI18n } from '@/components/i18n/language-provider';

export function ExportButton({
  analysis,
  lore,
}: {
  analysis: RepoAnalysis;
  lore: Lore;
}) {
  const { t } = useI18n();

  function download() {
    const md = buildReportMarkdown(analysis, lore, t, window.location.origin);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.identity.fullName.replace('/', '-')}-lore.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-sm text-muted-foreground transition-all hover:border-gold/30 hover:text-foreground"
    >
      <Download className="h-4 w-4" />
      {t.lore.export}
    </button>
  );
}
