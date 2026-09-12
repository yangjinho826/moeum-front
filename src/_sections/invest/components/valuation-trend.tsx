"use client";

import { Box, Group, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import FilterChip from "_features/common/components/filter-chip";
import { semanticColor } from "_styles/semantic-color";
import { trendYDomain } from "_utilities/chart";

export interface ValuationPoint {
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

interface ValuationTrendProps {
  /** 시간순 월별 평가액(마지막 = 현재) */
  points: ValuationPoint[];
}

/**
 * 투자 평가액 12개월 추이 — 선 1.5px chart-1, 축 모노 10 dim, 마지막 점 up/down + 값 라벨,
 * 아래 기간 칩(1·3·12개월·전체). Figma invest 25:198~25:217. 툴팁·그라데이션 없음.
 */
export default function ValuationTrend({ points }: ValuationTrendProps) {
  const t = useTranslations("portfolio");
  const { locale } = useParams<{ locale: string }>();
  const [period, setPeriod] = useState<Period>("12m");

  const months = PERIODS.find((p) => p.key === period)?.months ?? null;
  const data = (months ? points.slice(-months) : points).map((p) => ({
    m: Number(p.date.slice(5, 7)),
    v: p.value,
  }));
  if (data.length < 2) return null;

  const lastIdx = data.length - 1;
  const last = data[lastIdx]?.v ?? 0;
  const prev = data[lastIdx - 1]?.v ?? 0;
  const dirColor = semanticColor(last - prev >= 0 ? "up" : "down");
  const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });

  return (
    <Box pt={12}>
      <Text
        className="moeum-mono"
        fw={600}
        ta="right"
        style={{ fontSize: 11, lineHeight: "16px", letterSpacing: "0.06em", color: dirColor }}
      >
        {compact.format(last)}
      </Text>
      <Box className="moeum-chart" mt={6}>
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
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
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
    </Box>
  );
}
