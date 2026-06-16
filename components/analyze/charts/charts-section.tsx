'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { ChartSeries } from '@/types/analysis';
import { useT } from '@/components/i18n/language-provider';
import { SectionHeading } from '../section-heading';
import { AXIS_TICK, C, ChartCard, ChartTooltip, PIE_PALETTE } from './chart-kit';
import { CommitHeatmap } from './commit-heatmap';

export function ChartsSection({ charts }: { charts: ChartSeries }) {
  const t = useT();
  const hasCommits = charts.commitActivity.length > 0;
  const hasContrib = charts.contributorRanking.length > 0;
  const hasLangs = charts.languageDistribution.length > 0;
  const hasReleases = charts.releaseTimeline.length > 1;
  const hasGrowth = charts.growthMomentum.length > 1;
  const hasHeatmap = charts.commitHeatmap.length > 0;

  return (
    <section>
      <SectionHeading
        eyebrow={t.charts.eyebrow}
        title={t.charts.title}
        description={t.charts.subtitle}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {hasCommits && (
          <ChartCard
            title={t.charts.commitActivity}
            caption={t.charts.commitActivityCap}
          >
            <ResponsiveContainer>
              <AreaChart
                data={charts.commitActivity}
                margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
              >
                <defs>
                  <linearGradient id="gCommits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.gold} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={C.gold} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis
                  dataKey="period"
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={20}
                />
                <YAxis
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ stroke: C.gold, strokeOpacity: 0.2 }}
                  content={<ChartTooltip unit=" commits" />}
                />
                <Area
                  type="monotone"
                  dataKey="commits"
                  stroke={C.gold}
                  strokeWidth={2}
                  fill="url(#gCommits)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {hasGrowth && (
          <ChartCard
            title={t.charts.momentum}
            caption={t.charts.momentumCap}
          >
            <ResponsiveContainer>
              <AreaChart
                data={charts.growthMomentum}
                margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
              >
                <defs>
                  <linearGradient id="gGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={C.verdigris}
                      stopOpacity={0.45}
                    />
                    <stop
                      offset="100%"
                      stopColor={C.verdigris}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis
                  dataKey="period"
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={20}
                />
                <YAxis
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ stroke: C.verdigris, strokeOpacity: 0.2 }}
                  content={<ChartTooltip unit=" total" />}
                />
                <Area
                  type="monotone"
                  dataKey="momentum"
                  stroke={C.verdigris}
                  strokeWidth={2}
                  fill="url(#gGrowth)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {hasContrib && (
          <ChartCard
            title={t.charts.topContributors}
            caption={t.charts.topContributorsCap}
          >
            <ResponsiveContainer>
              <BarChart
                layout="vertical"
                data={charts.contributorRanking}
                margin={{ top: 0, right: 12, bottom: 0, left: 8 }}
              >
                <CartesianGrid stroke={C.grid} horizontal={false} />
                <XAxis
                  type="number"
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  hide
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={92}
                />
                <Tooltip
                  cursor={{ fill: C.grid }}
                  content={<ChartTooltip unit=" commits" />}
                />
                <Bar dataKey="commits" radius={[0, 4, 4, 0]}>
                  {charts.contributorRanking.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? C.gold : 'rgba(212,162,76,0.55)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {hasLangs && (
          <ChartCard
            title={t.charts.languages}
            caption={t.charts.languagesCap}
          >
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={charts.languageDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="none"
                >
                  {charts.languageDistribution.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_PALETTE[i % PIE_PALETTE.length]!}
                    />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="font-mono text-xs text-muted-foreground">
                      {value}
                    </span>
                  )}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      format={(e) =>
                        `${e.name}: ${(e.payload as { share?: number })?.share ?? 0}%`
                      }
                    />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {hasReleases && (
          <ChartCard
            title={t.charts.releaseCadence}
            caption={t.charts.releaseCadenceCap}
            className="lg:col-span-2"
          >
            <ResponsiveContainer>
              <LineChart
                data={charts.releaseTimeline}
                margin={{ top: 8, right: 12, bottom: 0, left: -18 }}
              >
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={36}
                />
                <YAxis
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ stroke: C.oxblood, strokeOpacity: 0.2 }}
                  content={
                    <ChartTooltip
                      format={(e) =>
                        `${(e.payload as { tag?: string })?.tag ?? ''} · #${e.value}`
                      }
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="index"
                  stroke={C.oxblood}
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: C.oxblood, strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {hasHeatmap && (
        <div className="mt-6">
          <ChartCard
            title={t.charts.heatmap}
            caption={t.charts.heatmapCap}
            className="lg:col-span-2"
            autoHeight
          >
            <CommitHeatmap data={charts.commitHeatmap} />
          </ChartCard>
        </div>
      )}
    </section>
  );
}
