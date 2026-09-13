"use client";

import { Group, Text } from "@mantine/core";
import type { ReactNode } from "react";

import { semanticColor, signColor } from "_styles/semantic-color";
import { fmt } from "_utilities/fmt";

interface DeltaPillProps {
  /** 증감액(원). 부호로 색·기호를 정한다 */
  value: number;
  /**
   * asset = 총자산·투자(▲▼, up/down 한국식)
   * ledger = 가계부(+−, income/expense)
   */
  variant: "asset" | "ledger";
  /** 증감률(%). 있으면 `+2.6%` 로 뒤에 붙는다 */
  rate?: number | null;
  /** 뒤에 붙는 설명 — "지난달보다" */
  caption?: ReactNode;
  /** lg = hero 아래 20/600 (기본) · sm = 행 안 14/600 */
  size?: "lg" | "sm";
}

/**
 * DeltaPill — 배경 없는 증감 표기 (DESIGN.md §5, Figma Delta 12:11).
 * `▲ 3,240,000  +2.6% · 지난달보다`. 색은 숫자와 기호에만.
 */
export default function DeltaPill({
  value,
  variant,
  rate,
  caption,
  size = "lg",
}: DeltaPillProps) {
  const color = semanticColor(signColor(value, variant));
  const abs = fmt(Math.abs(value));
  const sign =
    value === 0 ? "" : variant === "asset" ? (value > 0 ? "▲ " : "▼ ") : value > 0 ? "+" : "−";
  const rateText =
    rate == null || !Number.isFinite(rate)
      ? null
      : `${rate > 0 ? "+" : rate < 0 ? "−" : ""}${Math.abs(rate).toFixed(1)}%`;

  const big = size === "lg";
  return (
    <Group gap={8} align="baseline" wrap="nowrap" pt={big ? 4 : 0}>
      <Text
        className="moeum-mono"
        fw={600}
        style={{
          fontSize: big ? 20 : 14,
          lineHeight: big ? "26px" : "20px",
          letterSpacing: "-0.02em",
          color,
          whiteSpace: "nowrap",
        }}
      >
        {sign}
        {abs}
      </Text>
      {(rateText || caption) && (
        <Text
          c="dimmed"
          fw={500}
          style={{ fontSize: 13, lineHeight: "19px", whiteSpace: "nowrap" }}
        >
          {rateText && <span className="moeum-mono">{rateText}</span>}
          {rateText && caption ? " · " : null}
          {caption}
        </Text>
      )}
    </Group>
  );
}
