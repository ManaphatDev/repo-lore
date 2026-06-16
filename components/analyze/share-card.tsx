'use client';

import * as React from 'react';
import { Download, ImageIcon, Loader2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useT } from '@/components/i18n/language-provider';

export function ShareCard({ slug }: { slug: string }) {
  const t = useT();
  const [open, setOpen] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const ogUrl = `/api/og?repo=${slug}`;

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  async function download() {
    setDownloading(true);
    try {
      const res = await fetch(ogUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug.replace('/', '-')}-lore.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/50 px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-gold/40 hover:text-foreground"
      >
        <ImageIcon className="h-3.5 w-3.5" />
        {t.overview.card}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="flex max-h-[90vh] w-[640px] max-w-full flex-col overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-codex">
            <div className="flex items-center justify-between">
              <span className="eyebrow">{t.overview.cardPreview}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ogUrl}
              alt={`${slug} share card`}
              className="mt-3 aspect-[1200/630] w-full rounded-lg border border-border bg-muted/30 object-cover"
            />
            <Button
              type="button"
              onClick={download}
              disabled={downloading}
              className="mt-4 w-full"
            >
              {downloading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Download />
              )}
              {t.overview.cardDownload}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
