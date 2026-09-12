"use client";

import { SimpleGrid, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";

import { type SemanticColor, semanticColor } from "_styles/semantic-color";

export interface StatGridItem {
  /** 라벨 모노 11 대문자 dimmed */
  label: ReactNode;
  /** 값 모노 18/600 */
  value: ReactNode;
  color?: SemanticColor;
}

interface StatGridProps {
  items: StatGridItem[];
  /** 열 수(기본 items 길이) */
  cols?: number;
}

/**
 * StatGrid — N열 요약 (DESIGN.md §5, Figma StatGrid3 20:100).
 * 수입 · 지출 · 저축률 같은 3열. 좌정렬, 배경 없음, 위아래 8.
 */
export default function StatGrid({ items, cols }: StatGridProps) {
  return (
    <SimpleGrid cols={cols ?? items.length} spacing="md" py={8}>
      {items.map((it, i) => (
        <Stack key={i} gap={4} style={{ minWidth: 0 }}>
          <Text
            className="moeum-mono moeum-label"
            fw={600}
            c="dimmed"
            style={{
              textTransform: "uppercase",
            }}
          >
            {it.label}
          </Text>
          <Text
            className="moeum-mono moeum-stat-value"
            fw={600}
            style={{
              lineHeight: "24px",
              color: semanticColor(it.color ?? "text"),
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {it.value}
          </Text>
        </Stack>
      ))}
    </SimpleGrid>
  );
}
