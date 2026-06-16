import type { TimelineEvent } from '@/types/analysis';
import { formatNumber, monthYear } from '@/lib/format';
import { parseSemver } from './helpers';
import type { AnalysisContext } from './context';

export function buildTimeline(ctx: AnalysisContext): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const repo = ctx.repo;

  // 1. Genesis
  events.push({
    id: 'genesis',
    date: repo.created_at,
    label: monthYear(repo.created_at),
    title: 'Repository Created',
    description: `${repo.name} is initialised${
      repo.language ? ` as a ${repo.language} project` : ''
    }, beginning its recorded history on GitHub.`,
    kind: 'genesis',
  });

  // 2. Releases
  const releases = ctx.sortedReleases;
  if (releases.length > 0) {
    const first = releases[0]!;
    const firstDate = first.published_at ?? first.created_at;
    events.push({
      id: 'rel-first',
      date: firstDate,
      label: monthYear(firstDate),
      title: 'First Public Release',
      description: `Version ${first.tag_name} is published — the project's first tagged release reaches the world.`,
      kind: 'release',
      meta: first.tag_name,
    });

    // Major version bumps
    let lastMajor = parseSemver(first.tag_name)?.major ?? null;
    const majors: typeof releases = [];
    for (const r of releases.slice(1)) {
      const sv = parseSemver(r.tag_name);
      if (!sv) continue;
      if (lastMajor == null) lastMajor = sv.major;
      else if (sv.major > lastMajor) {
        majors.push(r);
        lastMajor = sv.major;
      }
    }
    for (const r of majors.slice(0, 4)) {
      const d = r.published_at ?? r.created_at;
      events.push({
        id: `rel-${r.id}`,
        date: d,
        label: monthYear(d),
        title: `Major Release — ${r.tag_name}`,
        description: `A new major version (${r.tag_name}) signals a significant architectural milestone for the project.`,
        kind: 'milestone',
        meta: r.tag_name,
      });
    }

    const last = releases[releases.length - 1]!;
    if (last.id !== first.id) {
      const d = last.published_at ?? last.created_at;
      events.push({
        id: 'rel-last',
        date: d,
        label: monthYear(d),
        title: `Latest Release — ${last.tag_name}`,
        description: `The most recent tagged release${
          last.prerelease ? ' (a pre-release)' : ''
        } brings the project to ${last.tag_name}.`,
        kind: 'release',
        meta: last.tag_name,
      });
    }
  }

  // 3. Development burst (busiest recent month)
  const busiest = ctx.commits.busiestMonth;
  if (busiest && busiest.count >= 4) {
    events.push({
      id: 'burst',
      date: busiest.date.toISOString(),
      label: monthYear(busiest.date),
      title: 'Development Burst',
      description: `A concentrated wave of work — ${busiest.count} commits land in ${monthYear(
        busiest.date,
      )} as the pace of development accelerates.`,
      kind: 'burst',
    });
  }

  // 4. Community expansion (approximate placement)
  if (ctx.contributorsTotal >= 15) {
    const approx = new Date(
      new Date(repo.created_at).getTime() + ctx.ageDays * 0.4 * 86_400_000,
    );
    events.push({
      id: 'community',
      date: approx.toISOString(),
      label: monthYear(approx),
      title: 'Community Expansion',
      description: `The contributor base widens toward ${ctx.contributorsTotal}${
        ctx.contributorsTotal >= 100 ? '+' : ''
      } developers as the project draws a broader circle of collaborators.`,
      kind: 'community',
      meta: 'approx.',
    });
  }

  // 5. Stewardship era
  const upkeepRatio = ctx.commits.ratios.fix + ctx.commits.ratios.maintenance;
  if (!repo.archived && ctx.ageYears > 2.5 && upkeepRatio > 0.5) {
    const d = new Date(
      new Date(repo.created_at).getTime() + ctx.ageDays * 0.82 * 86_400_000,
    );
    events.push({
      id: 'stewardship',
      date: d.toISOString(),
      label: monthYear(d),
      title: 'Into Stewardship',
      description: `Recent work tilts toward fixes and upkeep — the project settles into a phase of careful maintenance over rapid change.`,
      kind: 'maintenance',
    });
  }

  // 6. Present day
  events.push({
    id: 'present',
    date: repo.pushed_at,
    label: monthYear(repo.pushed_at),
    title: repo.archived ? 'Archived' : 'Present Day',
    description: repo.archived
      ? 'The repository has been archived — its story, for now, is complete.'
      : `Today the project stands at ${formatNumber(ctx.stars)} stars and ${
          ctx.contributorsTotal
        }${ctx.contributorsTotal >= 100 ? '+' : ''} contributors, its next chapter still unwritten.`,
    kind: 'present',
  });

  // Sort ascending, clamp to [created, pushed], dedupe by month+kind, cap.
  const min = new Date(repo.created_at).getTime();
  const max = new Date(repo.pushed_at).getTime();
  const seen = new Set<string>();

  return events
    .map((e) => {
      const t = new Date(e.date).getTime();
      const clamped = Math.min(Math.max(t, min), Math.max(max, min));
      return { ...e, date: new Date(clamped).toISOString() };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .filter((e) => {
      const key = `${e.label}-${e.kind}`;
      if (seen.has(key) && e.kind !== 'milestone') return false;
      seen.add(key);
      return true;
    })
    .slice(0, 11);
}
