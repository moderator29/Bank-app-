"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartTheme } from "./chart-theme";
import { money } from "@/lib/utils";

/** One tooltip shape for every chart in the app. */
function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; payload?: Record<string, unknown> }[];
  label?: string;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const fmt = formatter ?? ((v: number) => money(v));
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 shadow-e2">
      {label && <p className="mb-1 text-2xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="tnum text-sm font-semibold text-ink-900">
          {entry.name && <span className="mr-2 font-medium text-ink-400">{entry.name}</span>}
          {fmt(Number(entry.value ?? 0))}
        </p>
      ))}
    </div>
  );
}

const AXIS = { fontSize: 11, tickLine: false, axisLine: false } as const;

export function CashflowChart({
  data,
  height = 172,
}: {
  data: { month: string; inflow: number; outflow: number }[];
  height?: number;
}) {
  const t = useChartTheme();
  if (!t.ready) return <div className="skeleton rounded-md" style={{ height }} />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} barGap={3}>
        <XAxis dataKey="month" {...AXIS} stroke={t.color("--color-ink-400")} />
        <Tooltip
          cursor={{ fill: t.color("--color-ink-100"), opacity: 0.35 }}
          content={<ChartTooltip />}
        />
        <Bar
          name="In"
          dataKey="inflow"
          fill={t.color("--color-pos-500")}
          radius={[4, 4, 0, 0]}
          maxBarSize={16}
          animationDuration={420}
        />
        <Bar
          name="Out"
          dataKey="outflow"
          fill={t.color("--color-ink-300")}
          radius={[4, 4, 0, 0]}
          maxBarSize={16}
          animationDuration={420}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendChart({
  data,
  height = 150,
}: {
  data: { month: string; value: number }[];
  height?: number;
}) {
  const t = useChartTheme();
  if (!t.ready) return <div className="skeleton rounded-md" style={{ height }} />;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.35 || max * 0.05;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 6, right: 2, bottom: 0, left: 2 }}>
        <defs>
          <linearGradient id="aur-trend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.color("--color-ink-600")} stopOpacity={0.14} />
            <stop offset="100%" stopColor={t.color("--color-ink-600")} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" {...AXIS} stroke={t.color("--color-ink-400")} />
        <YAxis hide domain={[min - pad, max + pad]} />
        <Tooltip content={<ChartTooltip />} />
        <Area
          name="Balance"
          type="monotone"
          dataKey="value"
          stroke={t.color("--color-ink-900")}
          strokeWidth={2}
          fill="url(#aur-trend)"
          animationDuration={520}
          dot={false}
          activeDot={{ r: 3.5, strokeWidth: 0, fill: t.color("--color-ink-900") }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryDonut({
  data,
  height = 188,
}: {
  data: { name: string; value: number }[];
  height?: number;
}) {
  const t = useChartTheme();
  if (!t.ready) return <div className="skeleton rounded-3xl" style={{ height }} />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip content={<ChartTooltip />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="62%"
          outerRadius="94%"
          paddingAngle={1.5}
          stroke={t.color("--color-surface")}
          strokeWidth={2}
          animationDuration={480}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={t.ramp[i % t.ramp.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MiniBars({
  data,
  height = 120,
}: {
  data: { month: string; value: number }[];
  height?: number;
}) {
  const t = useChartTheme();
  if (!t.ready) return <div className="skeleton rounded-md" style={{ height }} />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <XAxis dataKey="month" {...AXIS} stroke={t.color("--color-ink-400")} />
        <Tooltip
          cursor={{ fill: t.color("--color-ink-100"), opacity: 0.35 }}
          content={<ChartTooltip />}
        />
        <Bar
          name="Spent"
          dataKey="value"
          fill={t.color("--color-ink-700")}
          radius={[4, 4, 0, 0]}
          maxBarSize={22}
          animationDuration={420}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
