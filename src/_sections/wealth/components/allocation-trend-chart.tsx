"use client";

import { Box, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import type { AssetClass } from "_features/portfolio/types";
import type { AllocationTrendPoint } from "_features/wealth/types";
import { useMonthLabel } from "_features/common/hooks/use-month-label";
import { type SemanticColor, semanticColor } from "_styles/semantic-color";
import { fmt } from "_utilities/fmt";

interface ChartRow {
  m: number;
  date: string;
  [assetClass: string]: string | number;
}

interface Props {
  data: AllocationTrendPoint[];
  /** 자산군 → 차트 색. 자산 구성 막대·행과 같은 색(현재 비중 순위) */
  colorOf: (assetClass: AssetClass) => SemanticColor;
  /** 쌓는 순서(아래 → 위) — 현재 비중 큰 순 */
  order: AssetClass[];
}

/**
 * 월별 자산군 배분 추이 — 적층 영역 (plan/2.md ③, Figma 46:195 AllocationTrend).
 * 채움 = chart-1..5 단색 0.9, 선·그라데이션·그리드 없음, 월 축 모노 11 dim, 툴팁 surface + hair.
 */
export default function AllocationTrendChart({ data, colorOf, order }: Props) {
  const tAssetClass = useTranslations("enum.asset-class");
  const monthLabel = useMonthLabel();

  // 기간 내 한 번이라도 등장한 자산군만 — 순서는 현재 비중 순, 지금 없는 군은 맨 위
  const present = new Set<AssetClass>(data.flatMap((p) => p.slices.map((s) => s.assetClass)));
  const classes = [...order.filter((c) => present.has(c)), ...[...present].filter((c) => !order.includes(c))];

  const rows: ChartRow[] = data.map((p) => {
    const row: ChartRow = { m: Number(p.snapshotDate.slice(5, 7)), date: p.snapshotDate };
    // 없는 슬라이스는 0 패딩 — 스택 영역 끊김 방지
    for (const c of classes) row[c] = 0;
    for (const s of p.slices) row[s.assetClass] = s.valuation;
    return row;
  });

  return (
    <Box className="moeum-chart" pt={4}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 140 }}>
        <AreaChart data={rows} margin={{ top: 6, right: 8, bottom: 0, left: 8 }}>
          {classes.map((c) => (
            <Area
              key={c}
              type="monotone"
              dataKey={c}
              stackId="allocation"
              stroke="none"
              fill={semanticColor(colorOf(c))}
              fillOpacity={0.9}
              isAnimationActive={false}
              activeDot={false}
            />
          ))}
          <Tooltip
            cursor={{ stroke: "var(--moeum-hair)", strokeWidth: 1 }}
            // 자산군 수만큼 줄이 늘어나는 툴팁 — 세로 이탈 허용해 잘림 방지
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
                  {[...classes].reverse().map((c) => {
                    const v = Number(row[c] ?? 0);
                    if (v === 0) return null;
                    return (
                      <Text key={c} className="moeum-mono" fw={600} style={{ fontSize: 12, lineHeight: "18px", color: semanticColor(colorOf(c)) }}>
                        {tAssetClass(c)} {fmt(v)}
                      </Text>
                    );
                  })}
                </Box>
              );
            }}
          />
          <XAxis
            dataKey="m"
            tick={{ fontSize: 11, fill: "var(--moeum-text-dim)", fontFamily: "var(--mantine-font-family-monospace)" }}
            axisLine={{ stroke: "var(--moeum-hair)" }}
            tickLine={false}
            interval={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
