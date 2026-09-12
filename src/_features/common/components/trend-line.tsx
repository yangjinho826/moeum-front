"use client";

import { Box, Group, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import FilterChip from "_features/common/components/filter-chip";
import { useMonthLabel } from "_features/common/hooks/use-month-label";
import { semanticColor, signColor } from "_styles/semantic-color";
import { trendYDomain } from "_utilities/chart";
import { fmt, fmtSignedPct } from "_utilities/fmt";

export interface TrendPoint {
  /** "YYYY-MM-DD" */
  date: string;
  value: number;
}

type Period = "1m" | "3m" | "12m" | "all";
const PERIODS: { key: Period; months: number | null }[] = [
  { key: "1m", months: 2 },
  { key: "3m", months: 4 },
  { key: "12m", months: 13 },
  { key: "all", months: null },
];

interface TrendLineProps {
  /** 시간순 월별 값(마지막 = 현재) */
  points: TrendPoint[];
  /** 아래 기간 칩(1·3·12개월·전체) — 투자 메인·종목 상세 */
  periods?: boolean;
  /** 우상단 마지막 값 compact 라벨 — 투자 메인 */
  showLast?: boolean;
  /** 호버 툴팁(월 · 금액 · 전월 대비) — 계좌·종목 상세 */
  tooltip?: boolean;
}

interface ChartRow {
  m: number;
  v: number;
  date: string;
  mom: number | null;
}

/**
 * 월별 추이선 — DESIGN.md §2-4: 선 1.5px chart-1 · 그라데이션·그리드 없음 · 축 모노 11 dim ·
 * 마지막 점만 up/down 3px. 투자 메인(Figma 25:198)·계좌 상세(41:365)·종목 상세(45:130) 공용.
 */
export default function TrendLine({ points, periods = false, showLast = false, tooltip = false }: TrendLineProps) {
  const t = useTranslations("portfolio");
  const monthLabel = useMonthLabel();
  const { locale } = useParams<{ locale: string }>();
  const [period, setPeriod] = useState<Period>("12m");

  const months = periods ? (PERIODS.find((p) => p.key === period)?.months ?? null) : null;
  const sliced = months ? points.slice(-months) : points;
  const data: ChartRow[] = sliced.map((p, i) => {
    const prev = i > 0 ? sliced[i - 1]?.value : undefined;
    return {
      m: Number(p.date.slice(5, 7)),
      v: p.value,
      date: p.date,
      mom: prev && prev > 0 ? ((p.value - prev) / prev) * 100 : null,
    };
  });
  if (data.length < 2) return null;

  const lastIdx = data.length - 1;
  const last = data[lastIdx]?.v ?? 0;
  const prev = data[lastIdx - 1]?.v ?? 0;
  const dirColor = semanticColor(last - prev >= 0 ? "up" : "down");
  const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });

  return (
    <Box pt={showLast ? 12 : 4}>
      {showLast && (
        <Text
          className="moeum-mono"
          fw={600}
          ta="right"
          style={{ fontSize: 11, lineHeight: "16px", letterSpacing: "0.06em", color: dirColor }}
        >
          {compact.format(last)}
        </Text>
      )}
      <Box className="moeum-chart" mt={showLast ? 6 : 0}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 140 }}>
          <LineChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: 6 }}>
            <XAxis
              dataKey="m"
              tick={{ fontSize: 11, fill: "var(--moeum-text-dim)", fontFamily: "var(--mantine-font-family-monospace)" }}
              axisLine={{ stroke: "var(--moeum-hair)" }}
              tickLine={false}
              interval={0}
            />
            <YAxis hide domain={trendYDomain(data.map((d) => d.v))} />
            {tooltip && (
              <Tooltip
                cursor={{ stroke: "var(--moeum-hair)", strokeWidth: 1 }}
                allowEscapeViewBox={{ x: false, y: true }}
                wrapperStyle={{ zIndex: 5 }}
                content={({ active, payload }) => {
                  const row = active ? (payload?.[0]?.payload as ChartRow | undefined) : undefined;
                  if (!row) return null;
                  return (
                    <Box
                      px={12}
                      py={8}
                      style={{
                        background: "var(--moeum-surface)",
                        border: "1px solid var(--moeum-hair)",
                        borderRadius: "var(--mantine-radius-md)",
                      }}
                    >
                      <Text c="dimmed" style={{ fontSize: 11, lineHeight: "16px" }}>
                        {monthLabel(row.date)}
                      </Text>
                      <Text className="moeum-mono" fw={600} c="var(--moeum-text)" style={{ fontSize: 14, lineHeight: "20px" }}>
                        {fmt(row.v)}
                      </Text>
                      {row.mom !== null && (
                        <Text
                          className="moeum-mono"
                          fw={600}
                          style={{ fontSize: 11, lineHeight: "16px", color: semanticColor(signColor(row.mom, "asset")) }}
                        >
                          {t("mom", { pct: fmtSignedPct(row.mom, 1) })}
                        </Text>
                      )}
                    </Box>
                  );
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="v"
              stroke="var(--moeum-chart-1)"
              strokeWidth={1.5}
              isAnimationActive={false}
              dot={(p: { cx?: number; cy?: number; index?: number }) =>
                p.index === lastIdx && p.cx != null && p.cy != null ? (
                  <circle key="last" cx={p.cx} cy={p.cy} r={3} fill={dirColor} />
                ) : (
                  <g key={`d${p.index ?? 0}`} />
                )
              }
              activeDot={tooltip ? { r: 4, fill: "var(--moeum-accent)", stroke: "none" } : false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      {periods && (
        <Group gap="lg" pt={10} wrap="nowrap">
          {PERIODS.map((p) => (
            <FilterChip
              key={p.key}
              label={t(`period_${p.key}`)}
              active={period === p.key}
              onClick={() => setPeriod(p.key)}
            />
          ))}
        </Group>
      )}
    </Box>
  );
}
