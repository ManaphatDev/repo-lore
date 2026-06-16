import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowUpRight, Star } from 'lucide-react';

import { fetchTrendingRepos, type TrendingRepo } from '@/services/github';
import { Reveal } from '@/components/reveal';
import { formatNumber } from '@/lib/format';
import { dictionaries } from '@/lib/i18n/dictionaries';
import { DEFAULT_LANG, isLang, LANG_STORAGE_KEY } from '@/lib/i18n/config';

function TrendingCard({ repo, cta, stars }: { repo: TrendingRepo; cta: string; stars: string }) {
  return (
    <Link
      href={`/analyze?repo=${repo.slug}`}
      className="hover-lift group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card/60 p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="truncate font-display text-lg font-semibold tracking-tight">
          <span className="text-muted-foreground">{repo.owner}/</span>
          {repo.name}
        </span>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold" />
      </div>

      {repo.language && (
        <span className="mt-2 w-fit rounded-full border border-border bg-background/40 px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
          {repo.language}
        </span>
      )}

      {repo.description && (
        <p className="mt-3 flex-1 line-clamp-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          {repo.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
        <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5" />
          {formatNumber(repo.stars)} {stars}
        </span>
        <span className="font-mono text-xs text-muted-foreground">{cta}</span>
      </div>
    </Link>
  );
}

export async function Trending() {
  const repos = await fetchTrendingRepos(6).catch(() => []);
  if (!repos.length) return null;

  // Localize the chrome from the lore_lang cookie at render time (same source
  // as the root layout). A client-side language toggle updates this section on
  // the next navigation/reload, like the other server-rendered prose.
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get(LANG_STORAGE_KEY)?.value;
  const lang = isLang(cookieLang) ? cookieLang : DEFAULT_LANG;
  const t = dictionaries[lang].trending;

  return (
    <section id="trending" className="border-b border-border/60 py-24">
      <div className="container">
        <Reveal>
          <header className="max-w-2xl">
            <span className="eyebrow">{t.eyebrow}</span>
            <h2 className="mt-3 text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {t.title}
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              {t.subtitle}
            </p>
          </header>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {repos.map((repo, i) => (
            <Reveal key={repo.slug} delay={i * 60} className="flex min-w-0 flex-col">
              <TrendingCard repo={repo} cta={t.cta} stars={t.stars} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
