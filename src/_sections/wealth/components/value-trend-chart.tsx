"use client";

import { Text } from "@mantine/core";
import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useMoney } from "_features/common/hooks/use-money";
import { trendYDomain } from "_utilities/chart";

// 서버에선 false, 클라 마운트 후 true — hydration-safe. recharts SSR prerender 회피용.
const noopSubscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

export interface TrendPoint {
  month: string; // "5월"
  value: number;
  momPct: number | null; // 전월 대비 증감률
}

// 차트 점에 호버하면 그달 금액 + 전월대비 증감을 보여줌
function TrendTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: TrendPoint }[];
}) {
  const money = useMoney();
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;
  return (
    <div
      style={{
        background: "var(--moeum-surface)",
        border: "1px solid var(--moeum-hair)",
        borderRadius: "var(--mantine-radius-md)",
        padding: "8px 12px",
      }}
    >
      <Text size="xs" c="dimmed" fw={600}>
        {p.month}
      </Text>
      <Text size="sm" fw={800} style={{ fontVariantNumeric: "tabular-nums" }}>
        {money(p.value)}
      </Text>
      {p.momPct !== null && (
        <Text
          size="xs"
          fw={700}
          style={{ fontVariantNumeric: "tabular-nums", color: `var(--moeum-${p.momPct >= 0 ? "up" : "down"})` }}
        >
          전월 {p.momPct >= 0 ? "+" : "−"}
          {Math.abs(p.momPct).toFixed(1)}%
        </Text>
      )}
    </div>
  );
}

interface Props {
  data: TrendPoint[];
  color?: string;
}

// 월별 추이 라인차트 — 표시 전용(drill-down 없음). 계좌/종목 화면에서 공용.
// 기본색 sage = 홈 총자산 hero(#7C9473)와 동일 — 추이 차트 전반 톤 통일.
export default function ValueTrendChart({ data, color = "#7C9473" }: Props) {
  // recharts ResponsiveContainer 는 SSR prerender 에서 깨질 수 있어 클라 마운트 후에만 그림
  const mounted = useMounted();

  // 같은 화면에 여러 차트가 떠도 gradient 가 안 겹치게 색 기반 id
  const gradientId = `trend-${color.replace("#", "")}`;

  // 마운트 전엔 차트 영역만 확보 (레이아웃 시프트 방지)
  if (!mounted) return <div className="chart-trend-wrap" />;

  return (
    <div className="chart-trend-wrap">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <AreaChart data={data} margin={{ top: 12, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
            activeDot={{
              r: 5,
              fill: color,
              stroke: "var(--mantine-color-body)",
              strokeWidth: 2,
            }}
          />
          {/* domain 을 데이터 min/max 에 ±2% 여백으로 타이트하게 —
              미설정 시 0 기준 스케일이라 잔액 대비 소폭 변동이 평평하게 뭉개짐 */}
          <YAxis
            hide
            domain={[
              (dataMin: number) => Math.floor(dataMin * 0.98),
              (dataMax: number) => Math.ceil(dataMax * 1.02),
            ]}
          />
          <Tooltip
            content={<TrendTooltip />}
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "3 3" }}
            // 96px 저높이 차트에서 다줄 툴팁이 위/아래로 잘리지 않게 세로 이탈 허용
            allowEscapeViewBox={{ x: false, y: true }}
            wrapperStyle={{ zIndex: 5 }}
          />
          <YAxis hide domain={trendYDomain(data.map((d) => d.value))} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 9, fill: "#9C8F82" }}
            axisLine={false}
            tickLine={false}
            interval={1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
