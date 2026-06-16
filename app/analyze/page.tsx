import { Suspense } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { runAnalysis } from '@/services/analyze';
import { isAiAvailable } from '@/lib/ai/lore-ai';
import { localizeAnalysis } from '@/lib/ai/translate';
import { parseRepoInput } from '@/lib/parse-repo';
import { DEFAULT_LANG, isLang, LANG_STORAGE_KEY } from '@/lib/i18n/config';
import { ReportSkeleton } from '@/components/analyze/report-skeleton';
import { AnalysisError } from '@/components/analyze/analysis-error';
import { EmptyState } from '@/components/analyze/empty-state';
import { Report } from '@/components/analyze/report';
import { Battle } from '@/components/analyze/battle';

interface PageProps {
  searchParams: Promise<{ repo?: string; url?: string; vs?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const ref = parseRepoInput(sp.repo ?? sp.url ?? '');
  const vsRef = parseRepoInput(sp.vs ?? '');
  if (!ref) return { title: 'Analyze a repository' };

  const slug = `${ref.owner}/${ref.repo}`;
  if (vsRef) {
    const vsSlug = `${vsRef.owner}/${vsRef.repo}`;
    const title = `${slug} vs ${vsSlug}`;
    const description = `Repo battle: ${slug} and ${vsSlug} compared trait by trait.`;
    const image = `/api/og?repo=${slug}&vs=${vsSlug}`;
    return {
      title,
      description,
      openGraph: { title, description, images: [image] },
      twitter: { card: 'summary_large_image', title, description, images: [image] },
    };
  }

  const title = slug;
  const description = `The lore of ${slug} — its timeline, DNA and story.`;
  const image = `/api/og?repo=${slug}`;
  return {
    title,
    description,
    openGraph: { title, description, images: [image] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function AnalyzePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const repo = (sp.repo ?? sp.url ?? '').trim();
  const vs = (sp.vs ?? '').trim();

  return (
    <div className="container py-10 md:py-14">
      {repo ? (
        vs ? (
          <Suspense
            key={`${repo}|${vs}`}
            fallback={<ReportSkeleton slug={repo} />}
          >
            <BattleLoader repo={repo} vs={vs} />
          </Suspense>
        ) : (
          <Suspense key={repo} fallback={<ReportSkeleton slug={repo} />}>
            <AnalysisLoader repo={repo} />
          </Suspense>
        )
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

async function resolveLang() {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get(LANG_STORAGE_KEY)?.value;
  return isLang(cookieLang) ? cookieLang : DEFAULT_LANG;
}

async function AnalysisLoader({ repo }: { repo: string }) {
  const lang = await resolveLang();

  const result = await runAnalysis(repo);
  if (!result.ok) return <AnalysisError error={result} repo={repo} />;

  const analysis =
    lang === 'th'
      ? await localizeAnalysis(result.analysis, 'th')
      : result.analysis;

  return <Report analysis={analysis} aiAvailable={isAiAvailable()} />;
}

async function BattleLoader({ repo, vs }: { repo: string; vs: string }) {
  const lang = await resolveLang();

  const [a, b] = await Promise.all([runAnalysis(repo), runAnalysis(vs)]);
  if (!a.ok) return <AnalysisError error={a} repo={repo} />;
  if (!b.ok) return <AnalysisError error={b} repo={vs} />;

  const [aA, bA] =
    lang === 'th'
      ? await Promise.all([
          localizeAnalysis(a.analysis, 'th'),
          localizeAnalysis(b.analysis, 'th'),
        ])
      : [a.analysis, b.analysis];

  return <Battle a={aA} b={bA} />;
}
