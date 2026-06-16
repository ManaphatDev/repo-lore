'use client';

import * as React from 'react';

/** Theme-independent palette chosen to read on both parchment and ink. */
export const C = {
  gold: '#d4a24c',
  verdigris: '#4ba892',
  oxblood: '#c0533b',
  axis: '#8f867a',
  grid: 'rgba(143, 134, 122, 0.16)',
};

export const PIE_PALETTE = [
  '#d4a24c',
  '#4ba892',
  '#c0533b',
  '#7d8cc4',
  '#bf8a3d',
  '#6aa6a0',
  '#9c6b9e',
];

export const AXIS_TICK = {
  fontSize: 11,
  fill: C.axis,
  fontFamily: 'var(--font-mono), monospace',
} as const;

interface TooltipEntry {
  name?: string | number;
  value?: string | number;
  color?: string;
  payload?: Record<string, unknown>;
}

export function ChartTooltip({
  active,
  payload,
  label,
  unit,
  format,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  unit?: string;
  format?: (entry: TooltipEntry) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-card/95 px-3 py-2 shadow-codex backdrop-blur">
      {label !== undefined && (
        <p className="mb-1 font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      )}
      {payload.map((entry, i) => (
        <p
          key={i}
          className="flex items-center gap-2 font-mono text-sm text-foreground"
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: entry.color ?? C.gold }}
          />
          {format
            ? format(entry)
            : `${entry.name ? `${entry.name}: ` : ''}${entry.value}${unit ?? ''}`}
        </p>
      ))}
    </div>
  );
}

export function ChartCard({
  title,
  caption,
  children,
  className,
  autoHeight = false,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
  className?: string;
  autoHeight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border border-border bg-card/60 p-6 ${className ?? ''}`}
    >
      <div className="mb-4">
        <h3 className="font-display text-lg font-medium tracking-tight">
          {title}
        </h3>
        {caption && (
          <p className="mt-0.5 text-xs text-muted-foreground">{caption}</p>
        )}
      </div>
      <div className={autoHeight ? 'w-full' : 'h-[240px] w-full'}>{children}</div>
    </div>
  );
}
