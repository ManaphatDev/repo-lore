'use client';

import * as React from 'react';
import {
  Briefcase,
  Clapperboard,
  Laugh,
  Loader2,
  Newspaper,
  Rocket,
  Search,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

import type { Lore, NarrativeMode, RepoAnalysis } from '@/types/analysis';
import { cn } from '@/lib/utils';
import { generateAllLore } from '@/features/lore/generator';
import { MODE_LIST } from '@/features/lore/modes';
import { useI18n } from '@/components/i18n/language-provider';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { SectionHeading } from './section-heading';
import { ExportButton } from './export-button';

const MODE_ICON: Record<string, LucideIcon> = {
  Clapperboard,
  Sparkles,
  Rocket,
  Briefcase,
  Laugh,
  Search,
  Newspaper,
};

function reasonMessage(t: Dictionary, reason?: string): string {
  switch (reason) {
    case 'invalid_api_key':
      return t.lore.reasons.invalid_api_key;
    case 'rate_limited':
      return t.lore.reasons.rate_limited;
    case 'quota_exceeded':
      return t.lore.reasons.quota_exceeded;
    case 'no_api_key':
      return t.lore.reasons.no_api_key;
    default:
      return t.lore.reasons.failed;
  }
}

/** Render lightweight *emphasis* markup as <em>. */
function renderProse(text: string): React.ReactNode[] {
  return text.split(/(\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export function LoreReader({
  analysis,
  aiAvailable = false,
}: {
  analysis: RepoAnalysis;
  aiAvailable?: boolean;
}) {
  const { lang, t } = useI18n();
  const allLore = React.useMemo(() => generateAllLore(analysis), [analysis]);
  const repoSlug = analysis.identity.fullName;

  const [mode, setMode] = React.useState<NarrativeMode>('documentary');
  const [aiOn, setAiOn] = React.useState(false);
  const [cache, setCache] = React.useState<Record<string, Lore>>({});
  const [loading, setLoading] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);

  // Thai always needs the server (AI translates). English only when toggled on.
  const wantsRemote = lang === 'th' || aiOn;
  const cacheKey = `${mode}:${lang}`;

  const loadRemote = React.useCallback(
    async (m: NarrativeMode, lg: 'en' | 'th') => {
      setLoading(true);
      setNotice(null);
      try {
        const res = await fetch('/api/lore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repo: repoSlug, mode: m, lang: lg }),
        });
        const data = await res.json();
        if (data?.ok && data.lore && data.enhanced) {
          setCache((c) => ({ ...c, [`${m}:${lg}`]: data.lore as Lore }));
        } else if (data?.ok) {
          setNotice(reasonMessage(t, data.reason));
        } else {
          setNotice(t.lore.reasons.unavailable);
        }
      } catch {
        setNotice(t.lore.reasons.failed);
      } finally {
        setLoading(false);
      }
    },
    [repoSlug, t],
  );

  React.useEffect(() => {
    if (wantsRemote && !cache[cacheKey] && !loading) void loadRemote(mode, lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, lang, aiOn]);

  const remote = cache[cacheKey];
  const lore = remote ?? allLore[mode];
  const showingRemote = Boolean(remote) && wantsRemote;
  const showAiToggle = lang === 'en' && aiAvailable;

  return (
    <section id="lore" className="scroll-mt-24">
      <SectionHeading
        eyebrow={t.lore.eyebrow}
        title={t.lore.title}
        description={t.lore.subtitle}
      />

      <div className="mt-7 flex flex-wrap items-center gap-2">
        {MODE_LIST.map((m) => {
          const Icon = MODE_ICON[m.icon] ?? Clapperboard;
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              aria-pressed={active}
              className={cn(
                'group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all',
                active
                  ? 'border-gold/50 bg-gold/15 text-gold shadow-glow'
                  : 'border-border bg-card/50 text-muted-foreground hover:border-gold/30 hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {t.lore.modes[m.id]}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          {showAiToggle && (
            <button
              type="button"
              onClick={() => setAiOn((v) => !v)}
              aria-pressed={aiOn}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all',
                aiOn
                  ? 'border-verdigris/50 bg-verdigris/15 text-verdigris shadow-glow'
                  : 'border-border bg-card/50 text-muted-foreground hover:border-verdigris/40 hover:text-foreground',
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {t.lore.aiProse}
            </button>
          )}
          <ExportButton analysis={analysis} lore={lore} />
        </div>
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
        <span>{t.lore.blurbs[mode]}</span>
        {loading && lang === 'th' && (
          <span className="inline-flex items-center gap-1 text-verdigris">
            <Loader2 className="h-3 w-3 animate-spin" /> AI…
          </span>
        )}
        {showingRemote && (
          <span className="inline-flex items-center gap-1 rounded-full border border-verdigris/30 bg-verdigris/10 px-2 py-0.5 text-verdigris">
            <Sparkles className="h-3 w-3" />
            {lang === 'th' ? t.lore.langNote : t.lore.aiEnhanced}
          </span>
        )}
        {notice && <span className="text-oxblood">{notice}</span>}
      </p>

      <article
        key={`${mode}-${lang}-${showingRemote}`}
        className={cn(
          'mx-auto mt-8 max-w-3xl animate-fade-in rounded-2xl border border-border bg-card/40 p-7 shadow-codex transition-opacity sm:p-12',
          loading && 'opacity-60',
        )}
      >
        <header className="text-center">
          <h3 className="text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {lore.title}
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-pretty font-serif text-lg italic text-muted-foreground">
            {lore.logline}
          </p>
          <div className="rule-ornament mx-auto mt-6 max-w-xs text-gold/60">
            ❧
          </div>
        </header>

        <div className="mt-10 space-y-12">
          {lore.chapters.map((chapter, idx) => (
            <div key={chapter.number}>
              <div className="mb-4">
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
                  {t.lore.chapter} {chapter.number}
                </span>
                <h4 className="mt-1.5 font-display text-2xl font-semibold tracking-tight">
                  {chapter.title}
                </h4>
                <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {chapter.subtitle}
                </p>
              </div>
              <div className={cn('lore-prose', idx === 0 && 'has-dropcap')}>
                {chapter.paragraphs.map((p, i) => (
                  <p key={i}>{renderProse(p)}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
