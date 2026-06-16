'use client';

import * as React from 'react';

const CELL = 11;
const GAP = 2;
const STRIDE = CELL + GAP;
const TOP = 20;
const LEFT = 28;

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS: Array<[number, string]> = [[1, 'Mon'], [3, 'Wed'], [5, 'Fri']];

function opacity(count: number): number {
  if (count === 0) return 0.07;
  if (count === 1) return 0.3;
  if (count <= 3) return 0.55;
  if (count <= 6) return 0.78;
  return 1;
}

export function CommitHeatmap({
  data,
}: {
  data: Array<{ date: string; count: number }>;
}) {
  const { cells, monthLabels, svgW, svgH } = React.useMemo(() => {
    if (data.length === 0) return { cells: [], monthLabels: [], svgW: 0, svgH: 0 };

    const countMap = new Map<string, number>();
    for (const { date, count } of data) countMap.set(date, count);

    const sorted = [...data.map((d) => d.date)].sort();
    const firstCommit = new Date(sorted[0]! + 'T00:00:00Z');
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Align start to Sunday of the first commit's week
    const start = new Date(firstCommit);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());

    const totalDays = Math.ceil((today.getTime() - start.getTime()) / 86400000) + 1;
    const weeks = Math.ceil(totalDays / 7);

    const cells: Array<{ col: number; row: number; date: string; count: number }> = [];
    const seenMonths = new Set<string>();
    const monthLabels: Array<{ col: number; label: string }> = [];

    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < 7; d++) {
        const date = new Date(start.getTime() + (w * 7 + d) * 86400000);
        if (date > today) continue;
        const iso = date.toISOString().slice(0, 10);
        const count = countMap.get(iso) ?? 0;
        cells.push({ col: w, row: d, date: iso, count });

        // Month label on the first cell of each month
        if (date.getUTCDate() === 1) {
          const key = iso.slice(0, 7);
          if (!seenMonths.has(key)) {
            seenMonths.add(key);
            monthLabels.push({ col: w, label: MONTHS[date.getUTCMonth()]! });
          }
        }
      }
    }

    return {
      cells,
      monthLabels,
      svgW: LEFT + weeks * STRIDE,
      svgH: TOP + 7 * STRIDE - GAP,
    };
  }, [data]);

  if (cells.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <svg
        width={svgW}
        height={svgH}
        aria-label="Commit activity heatmap"
        style={{ display: 'block' }}
      >
        {/* Month labels */}
        {monthLabels.map(({ col, label }) => (
          <text
            key={`m-${col}`}
            x={LEFT + col * STRIDE}
            y={12}
            fontSize={9}
            fill="rgba(143,134,122,0.9)"
            fontFamily="var(--font-mono),monospace"
          >
            {label}
          </text>
        ))}

        {/* Day labels */}
        {DAY_LABELS.map(([row, label]) => (
          <text
            key={label}
            x={LEFT - 4}
            y={TOP + row * STRIDE + CELL}
            fontSize={9}
            textAnchor="end"
            fill="rgba(143,134,122,0.9)"
            fontFamily="var(--font-mono),monospace"
          >
            {label}
          </text>
        ))}

        {/* Cells */}
        {cells.map(({ col, row, date, count }) => (
          <rect
            key={date}
            x={LEFT + col * STRIDE}
            y={TOP + row * STRIDE}
            width={CELL}
            height={CELL}
            rx={2}
            fill={`rgba(212,162,76,${opacity(count)})`}
          >
            <title>{`${date}: ${count} commit${count !== 1 ? 's' : ''}`}</title>
          </rect>
        ))}
      </svg>
    </div>
  );
}
