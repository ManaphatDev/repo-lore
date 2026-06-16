'use client';

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import type { DnaScore } from '@/types/analysis';
import { useT } from '@/components/i18n/language-provider';
import { AXIS_TICK, C, ChartTooltip } from './chart-kit';

export function BattleRadar({
  a,
  b,
  aLabel,
  bLabel,
}: {
  a: DnaScore[];
  b: DnaScore[];
  aLabel: string;
  bLabel: string;
}) {
  const t = useT();
  const data = a.map((d) => ({
    trait: t.dna.categories[d.category],
    [aLabel]: d.score,
    [bLabel]: b.find((x) => x.category === d.category)?.score ?? 0,
  }));

  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="68%">
          <PolarGrid stroke={C.grid} />
          <PolarAngleAxis dataKey="trait" tick={AXIS_TICK} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey={aLabel}
            stroke={C.gold}
            fill={C.gold}
            fillOpacity={0.22}
            strokeWidth={2}
          />
          <Radar
            dataKey={bLabel}
            stroke={C.verdigris}
            fill={C.verdigris}
            fillOpacity={0.18}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: 12,
            }}
          />
          <Tooltip content={<ChartTooltip unit="/100" />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
