"use client";

import { ActionIcon, Group, Stack, Text } from "@mantine/core";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { fmt } from "_utilities/fmt";

interface HeroAmountProps {
  /** 좌상단 모노 11 캡션 — `2026.09.11 기준 ·` + accent 링크 등 */
  caption?: ReactNode;
  /** 캡션 행 우측 슬롯. 없고 onToggleBlur 있으면 눈 토글 */
  captionRight?: ReactNode;
  /** 라벨 13 dimmed — "총자산" */
  label: ReactNode;
  /** 금액(원). 44/60 모노 700 */
  amount: number;
  /** 금액 옆 단위(기본 "원") */
  unit?: ReactNode;
  /** 단위 뒤 슬롯 — 컴팩트 hero 의 `▲ 1.46%` */
  amountRight?: ReactNode;
  /** 28px 컴팩트(투자 평가금액). 위 20 · 아래 8 */
  compact?: boolean;
  /** 금액 블러(숫자 숨김) */
  blurred?: boolean;
  onToggleBlur?: () => void;
  /** 금액 아래 — DeltaPill 등 */
  children?: ReactNode;
}

/**
 * HeroAmount — 카드 밖 큰 숫자 (DESIGN.md §5, Figma HeroAmount 12:6).
 * 캡션 행 → 라벨 → 금액+단위 → children(DeltaPill). 위 24 · 아래 12 여백.
 */
export default function HeroAmount({
  caption,
  captionRight,
  label,
  amount,
  unit,
  amountRight,
  compact = false,
  blurred = false,
  onToggleBlur,
  children,
}: HeroAmountProps) {
  const tg = useTranslations("general");
  const th = useTranslations("home");
  const toggle =
    captionRight ??
    (onToggleBlur ? (
      <ActionIcon
        variant="subtle"
        color="gray"
        size="lg"
        onClick={onToggleBlur}
        aria-label={blurred ? th("show_amount") : th("hide_amount")}
        style={{ margin: -8 }}
      >
        {blurred ? (
          <IconEyeOff size={18} stroke={2} color="var(--moeum-text-dim)" />
        ) : (
          <IconEye size={18} stroke={2} color="var(--moeum-text-dim)" />
        )}
      </ActionIcon>
    ) : null);

  return (
    <Stack gap={6} pt={compact ? 20 : "xl"} pb={compact ? 8 : 12} w="100%">
      {(caption || toggle) && (
        <Group justify="space-between" align="center" wrap="nowrap">
          <Text
            className="moeum-mono"
            fw={600}
            c="dimmed"
            style={{ fontSize: 11, lineHeight: "16px", letterSpacing: "0.06em" }}
          >
            {caption}
          </Text>
          {toggle}
        </Group>
      )}
      <Text c="dimmed" fw={500} style={{ fontSize: 13, lineHeight: "19px" }}>
        {label}
      </Text>
      <Group gap={6} align="baseline" wrap="nowrap">
        <Text
          className={compact ? "moeum-mono moeum-hero-amount-compact" : "moeum-mono moeum-hero-amount"}
          c="var(--moeum-text)"
          style={{
            whiteSpace: "nowrap",
            filter: blurred ? "blur(10px)" : undefined,
            transition: "filter 150ms ease-out",
            userSelect: blurred ? "none" : undefined,
          }}
        >
          {fmt(amount)}
        </Text>
        <Text c="dimmed" fw={500} style={{ fontSize: 13, lineHeight: "19px" }}>
          {unit ?? tg("won")}
        </Text>
        {amountRight}
      </Group>
      {children}
    </Stack>
  );
}
