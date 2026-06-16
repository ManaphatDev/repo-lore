'use client';

import {
  Bug,
  Compass,
  Hammer,
  Heart,
  Wrench,
  User,
  type LucideIcon,
} from 'lucide-react';

import type { ContributorProfile, ContributorRole } from '@/types/analysis';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useT } from '@/components/i18n/language-provider';
import { SectionHeading } from './section-heading';

const ROLE: Record<
  ContributorRole,
  { icon: LucideIcon; accent: string; chip: string }
> = {
  'The Architect': {
    icon: Compass,
    accent: 'text-gold',
    chip: 'border-gold/30 bg-gold/10 text-gold',
  },
  'The Feature Builder': {
    icon: Hammer,
    accent: 'text-verdigris',
    chip: 'border-verdigris/30 bg-verdigris/10 text-verdigris',
  },
  'The Bug Hunter': {
    icon: Bug,
    accent: 'text-oxblood',
    chip: 'border-oxblood/30 bg-oxblood/10 text-oxblood',
  },
  'The Maintainer': {
    icon: Wrench,
    accent: 'text-muted-foreground',
    chip: 'border-border bg-muted text-muted-foreground',
  },
  'The Community Champion': {
    icon: Heart,
    accent: 'text-gold',
    chip: 'border-gold/30 bg-gold/10 text-gold',
  },
  'The Contributor': {
    icon: User,
    accent: 'text-muted-foreground',
    chip: 'border-border bg-muted text-muted-foreground',
  },
};

function ContributorCard({ profile }: { profile: ContributorProfile }) {
  const t = useT();
  const role = ROLE[profile.role];
  const Icon = role.icon;
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card/60 p-5 transition-colors hover:border-gold/30">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.avatar}
          alt={profile.login}
          width={44}
          height={44}
          className="h-11 w-11 rounded-full border border-border"
          referrerPolicy="no-referrer"
        />
        <div className="min-w-0">
          <a
            href={profile.url}
            target="_blank"
            rel="noreferrer"
            className="block truncate font-display text-lg font-medium tracking-tight hover:text-gold"
          >
            {profile.login}
          </a>
          <span
            className={cn(
              'mt-0.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[0.65rem]',
              role.chip,
            )}
          >
            <Icon className="h-3 w-3" />
            {t.contributors.roles[profile.role]}
          </span>
        </div>
      </div>

      <p className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
        {profile.rationale}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 font-mono text-xs text-muted-foreground">
        <span>
          {formatNumber(profile.contributions)} {t.contributors.commits}
        </span>
        <span className={role.accent}>
          {profile.share}% {t.contributors.ofRanked}
        </span>
      </div>
    </div>
  );
}

export function Contributors({
  contributors,
}: {
  contributors: ContributorProfile[];
}) {
  const t = useT();
  if (contributors.length === 0) return null;
  return (
    <section>
      <SectionHeading
        id="contributors"
        eyebrow={t.contributors.eyebrow}
        title={t.contributors.title}
        description={t.contributors.subtitle}
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contributors.map((c) => (
          <ContributorCard key={c.login} profile={c} />
        ))}
      </div>
    </section>
  );
}
