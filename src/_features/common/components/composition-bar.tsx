"use client";

import { Box } from "@mantine/core";

import { type SemanticColor, semanticColor } from "_styles/semantic-color";

export interface CompositionSegment {
  key: string;
  /** 0~1. 합이 1 미만이면 남는 부분은 트랙(hair-2) */
  ratio: number;
  color: SemanticColor;
}

interface CompositionBarProps {
  segments: CompositionSegment[];
  /** 높이(기본 6) */
  height?: number;
}

/**
 * CompositionBar — 도넛 대신 쓰는 구성 막대 한 줄 (DESIGN.md §1 "도넛 외 장식 차트 없음").
 * 종목 비중·자산 구성처럼 "전체가 어떻게 쪼개졌나"를 한눈에. 아래 행의 색 점과 같은 색.
 */
export default function CompositionBar({ segments, height = 6 }: CompositionBarProps) {
  return (
    <Box
      role="img"
      style={{
        display: "flex",
        height,
        borderRadius: height / 2,
        overflow: "hidden",
        background: "var(--moeum-hair-2)",
      }}
      my={6}
    >
      {segments.map((s) => (
        <Box
          key={s.key}
          style={{
            width: `${Math.max(0, Math.min(1, s.ratio)) * 100}%`,
            height,
            background: semanticColor(s.color),
            flexShrink: 0,
          }}
        />
      ))}
    </Box>
  );
}
