import type { Lore, RepoAnalysis } from '@/types/analysis';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { formatNumber, humanHours } from '@/lib/format';

/**
 * Serialize a report (overview + DNA + the given lore) to a portable Markdown
 * document. Pure — works on the client from data it already has.
 */
export function buildReportMarkdown(
  analysis: RepoAnalysis,
  lore: Lore,
  t: Dictionary,
  origin: string,
): string {
  const id = analysis.identity;
  const stats = analysis.stats;
  const slug = id.fullName;
  const reportUrl = `${origin}/analyze?repo=${slug}`;
  const badgeUrl = `${origin}/api/badge?repo=${slug}`;

  const out: string[] = [];

  out.push(`# ${slug}`, '');
  if (id.description) out.push(`> ${id.description}`, '');
  out.push(
    `**${t.maturity[analysis.maturity.stage]}** · ${analysis.maturity.index}/100`,
    '',
    `[![Repo Lore](${badgeUrl})](${reportUrl})`,
    '',
    `[${t.exportMd.viewReport}](${reportUrl})`,
    '',
  );

  // Overview
  out.push(
    `## ${t.exportMd.overview}`,
    '',
    '| | |',
    '| --- | --- |',
    `| ${t.overview.stars} | ${formatNumber(id.stars)} |`,
    `| ${t.overview.forks} | ${formatNumber(id.forks)} |`,
    `| ${t.overview.contributors} | ${formatNumber(stats.totalContributors)}${stats.totalContributors >= 100 ? '+' : ''} |`,
    `| ${t.overview.releases} | ${formatNumber(stats.totalReleases)} |`,
    `| ${t.overview.commitsPerWeek} | ${stats.commitsPerWeek} |`,
    `| ${t.overview.openIssues} | ${formatNumber(id.openIssues)} |`,
    '',
  );

  // DNA
  out.push(`## ${t.exportMd.dna}`, '', '| | |', '| --- | --- |');
  for (const d of analysis.dna) {
    out.push(`| ${t.dna.categories[d.category]} | ${d.score}/100 |`);
  }
  out.push('');

  // Project health
  const hl = stats.health;
  if (hl.prsConsidered > 0 || hl.issuesConsidered > 0) {
    const dash = '—';
    const pct = (r: number | null) => (r != null ? `${Math.round(r * 100)}%` : dash);
    const lat = (hours: number | null) => (hours != null ? humanHours(hours) : dash);
    out.push(
      `## ${t.exportMd.health}`,
      '',
      '| | |',
      '| --- | --- |',
      `| ${t.exportMd.healthMergeRate} | ${pct(hl.prMergeRate)} |`,
      `| ${t.exportMd.healthTimeToMerge} | ${lat(hl.medianMergeHours)} |`,
      `| ${t.exportMd.healthIssueClose} | ${pct(hl.issueCloseRate)} |`,
      `| ${t.exportMd.healthTimeToClose} | ${lat(hl.medianCloseHours)} |`,
      `| ${t.exportMd.healthBacklog} | ${formatNumber(hl.openIssues)} |`,
      '',
    );
  }

  // Lore
  out.push(`## ${lore.title}`, '', `*${lore.logline}*`, '');
  for (const chapter of lore.chapters) {
    out.push(
      `### ${t.lore.chapter} ${chapter.number} — ${chapter.title}`,
      '',
      `_${chapter.subtitle}_`,
      '',
      ...chapter.paragraphs.flatMap((p) => [p, '']),
    );
  }

  out.push('---', '', `${t.exportMd.generatedBy} · ${reportUrl}`, '');

  return out.join('\n');
}
