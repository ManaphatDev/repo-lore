'use client';

import * as React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Github,
  KeyRound,
  Loader2,
  RefreshCw,
  Sparkles,
  XCircle,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useT } from '@/components/i18n/language-provider';
import { Reveal } from '@/components/reveal';

interface StatusData {
  ok: boolean;
  checkedAt: string;
  github: {
    reachable: boolean;
    tokenConfigured: boolean;
    tokenValid: boolean;
    authenticated: boolean;
    limit: number;
    remaining: number;
    used: number;
    resetInSeconds: number | null;
    message: string;
  };
  ai: { available: boolean; model: string | null };
}

type State =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'error' }
  | { phase: 'done'; data: StatusData };

function formatReset(seconds: number | null): string {
  if (seconds == null) return '—';
  if (seconds <= 0) return 'now';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Activity;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border/60 py-3 first:border-t-0">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className="text-right text-sm">{children}</span>
    </div>
  );
}

function Pill({
  tone,
  children,
}: {
  tone: 'ok' | 'warn' | 'bad' | 'muted';
  children: React.ReactNode;
}) {
  const tones = {
    ok: 'border-verdigris/30 bg-verdigris/10 text-verdigris',
    warn: 'border-gold/30 bg-gold/10 text-gold',
    bad: 'border-oxblood/30 bg-oxblood/10 text-oxblood',
    muted: 'border-border bg-muted text-muted-foreground',
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-xs',
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function ApiStatusSection() {
  const t = useT();
  const [state, setState] = React.useState<State>({ phase: 'idle' });

  async function check() {
    setState({ phase: 'loading' });
    try {
      const res = await fetch('/api/status', { cache: 'no-store' });
      const data = (await res.json()) as StatusData;
      setState({ phase: 'done', data });
    } catch {
      setState({ phase: 'error' });
    }
  }

  return (
    <section id="status" className="border-t border-border/60 py-24">
      <div className="container max-w-2xl">
        <Reveal>
          <header className="text-center">
            <span className="eyebrow">{t.status.eyebrow}</span>
            <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.status.title}
            </h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              {t.status.subtitle}
            </p>
          </header>
        </Reveal>

        <Reveal delay={100} className="mt-8 rounded-2xl border border-border bg-card/60 p-6 shadow-codex sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <Activity className="h-4 w-4 text-gold" />
              GET /api/status
            </div>
            <Button onClick={check} variant="foil" size="sm">
              {state.phase === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {state.phase === 'done' ? t.status.recheck : t.status.checkNow}
            </Button>
          </div>

          {state.phase === 'idle' && (
            <p className="mt-6 text-center text-sm text-muted-foreground/70">
              {t.status.idleHint}
            </p>
          )}

          {state.phase === 'error' && (
            <p className="mt-6 flex items-center justify-center gap-2 text-sm text-oxblood">
              <XCircle className="h-4 w-4" /> {t.status.unavailable}
            </p>
          )}

          {state.phase === 'done' && (
            <div className="mt-6 animate-fade-in">
              <Row icon={Github} label={t.status.githubApi}>
                {state.data.github.reachable ? (
                  <Pill tone="ok">
                    <CheckCircle2 className="h-3 w-3" /> {t.status.reachable}
                  </Pill>
                ) : (
                  <Pill tone="bad">
                    <XCircle className="h-3 w-3" /> {t.status.unreachable}
                  </Pill>
                )}
              </Row>

              <Row icon={KeyRound} label={t.status.auth}>
                {state.data.github.authenticated ? (
                  <Pill tone="ok">{t.status.tokenActive}</Pill>
                ) : state.data.github.tokenConfigured ? (
                  <Pill tone="bad">
                    <AlertTriangle className="h-3 w-3" /> {t.status.tokenInvalid}
                  </Pill>
                ) : (
                  <Pill tone="warn">{t.status.anonymous}</Pill>
                )}
              </Row>

              <Row icon={Activity} label={t.status.rateLimit}>
                <span className="font-mono">
                  {state.data.github.remaining.toLocaleString()} /{' '}
                  {state.data.github.limit.toLocaleString()}
                </span>
              </Row>

              <div className="pb-1">
                <Progress
                  value={
                    state.data.github.limit > 0
                      ? (state.data.github.remaining /
                          state.data.github.limit) *
                        100
                      : 0
                  }
                  className="h-1.5"
                  indicatorClassName={
                    state.data.github.remaining /
                      (state.data.github.limit || 1) <
                    0.15
                      ? 'bg-oxblood'
                      : 'bg-verdigris'
                  }
                />
              </div>

              <Row icon={RefreshCw} label={t.status.resetsIn}>
                <span className="font-mono">
                  {formatReset(state.data.github.resetInSeconds)}
                </span>
              </Row>

              <Row icon={Sparkles} label={t.status.aiProse}>
                {state.data.ai.available ? (
                  <Pill tone="ok">
                    {t.status.on} · {state.data.ai.model}
                  </Pill>
                ) : (
                  <Pill tone="muted">{t.status.off}</Pill>
                )}
              </Row>

              <p className="mt-4 text-pretty text-xs text-muted-foreground/80">
                {state.data.github.message}
              </p>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
