"use client";

import { Box } from "@mantine/core";
import { Line, LineChart, ResponsiveContainer } from "recharts";

import { semanticColor } from "_styles/semantic-color";

interface SparklineProps {
  /** 시간순 값. 마지막 점이 현재 */
  values: number[];
  /** 높이(기본 44). className 을 주면 CSS 가 높이를 정한다 */
  height?: number;
  className?: string;
  /** 점 탭 → 인덱스. 없으면 정적 */
  onPointClick?: (index: number) => void;
  /** 점별 접근성 이름(월 라벨 등). onPointClick 과 함께 */
  labels?: string[];
}

/**
 * Sparkline — 축·그리드·툴팁 없는 1.5px 추이선 (DESIGN.md §2-4·§5, Figma Sparkline 12:14).
 * 선 = chart-1(accent), 마지막 점만 3px up/down(직전 대비 방향).
 * onPointClick 이 있으면(탭 → 그달 분해) 각 점 2px + hover 4px 로 "누를 수 있음"을 보인다.
 */
export default function Sparkline({
  values,
  height = 44,
  className,
  onPointClick,
  labels,
}: SparklineProps) {
  if (values.length < 2) return null;
  const data = values.map((v, i) => ({ i, v }));
  const lastIdx = values.length - 1;
  const lastDir = (values[lastIdx] ?? 0) - (values[lastIdx - 1] ?? 0);
  const lastColor = semanticColor(lastDir >= 0 ? "up" : "down");

  return (
    <Box
      className={className}
      style={{ width: "100%", height: className ? undefined : height }}
      pt={10}
      pb={4}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 44 }}>
        <LineChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 4, left: 0 }}
          accessibilityLayer={false}
          style={{ cursor: onPointClick ? "pointer" : undefined }}
        >
          <Line
            type="monotone"
            dataKey="v"
            stroke="var(--moeum-chart-1)"
            strokeWidth={1.5}
            isAnimationActive={false}
            dot={(p: { cx?: number; cy?: number; index?: number }) => {
              const idx = p.index ?? 0;
              if (p.cx == null || p.cy == null) return <g key={`d${idx}`} />;
              const isLast = idx === lastIdx;
              if (!onPointClick) {
                return isLast ? (
                  <circle key="last" cx={p.cx} cy={p.cy} r={3} fill={lastColor} />
                ) : (
                  <g key={`d${idx}`} />
                );
              }
              // 툴팁이 없어 chart onClick 에 activeIndex 가 안 실린다 → 점마다 10px 투명 히트영역.
              // hover 강조는 CSS(.moeum-spark-dot) — recharts activeDot 은 점 위에 겹쳐 클릭을 삼킨다
              return (
                <g
                  key={`d${idx}`}
                  className="moeum-spark-dot"
                  role="button"
                  tabIndex={0}
                  aria-label={labels?.[idx] ?? String(idx + 1)}
                  onClick={() => onPointClick(idx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onPointClick(idx);
                    }
                  }}
                >
                  <circle cx={p.cx} cy={p.cy} r={10} fill="transparent" />
                  <circle
                    cx={p.cx}
                    cy={p.cy}
                    r={isLast ? 3 : 2}
                    fill={isLast ? lastColor : "var(--moeum-chart-1)"}
                  />
                </g>
              );
            }}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
