'use client';

import {
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

export function DnaRadar({ dna }: { dna: DnaScore[] }) {
  const t = useT();
  const data = dna.map((d) => ({
    trait: t.dna.categories[d.category],
    score: d.score,
  }));
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke={C.grid} />
          <PolarAngleAxis dataKey="trait" tick={AXIS_TICK} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="score"
            stroke={C.gold}
            fill={C.gold}
            fillOpacity={0.28}
            strokeWidth={2}
            dot
          />
          <Tooltip content={<ChartTooltip unit="/100" />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
