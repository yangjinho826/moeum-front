"use client";

import { ActionIcon, Group, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { currentYearMonthKst } from "_utilities/datetime";

interface MonthPickerProps {
  /** "YYYY-MM" */
  value: string;
  onChange: (next: string) => void;
}

/**
 * 월 선택 — `‹ 2026.09 ›` 모노 15/600, 화살표 16 (Figma MonthPicker 22:99).
 * value/onChange 는 "YYYY-MM" 문자열로 외부 동기화 (URL/state 둘 다 호환).
 */
export default function MonthPicker({ value, onChange }: MonthPickerProps) {
  const tg = useTranslations("general.common");
  const [yearStr, monthStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  const shift = (delta: number) => {
    const total = year * 12 + (month - 1) + delta;
    const nextYear = Math.floor(total / 12);
    const nextMonth = (total % 12) + 1;
    onChange(`${nextYear}-${String(nextMonth).padStart(2, "0")}`);
  };

  return (
    <Group gap={2} align="center" wrap="nowrap">
      <ActionIcon variant="subtle" color="gray" size="lg" onClick={() => shift(-1)} aria-label={tg("prev_month")}>
        <IconChevronLeft size={16} stroke={2} color="var(--moeum-text-dim)" />
      </ActionIcon>
      <Text className="moeum-mono" fw={600} c="var(--moeum-text)" style={{ fontSize: 15, lineHeight: "20px" }}>
        {year}.{String(month).padStart(2, "0")}
      </Text>
      <ActionIcon variant="subtle" color="gray" size="lg" onClick={() => shift(1)} aria-label={tg("next_month")}>
        <IconChevronRight size={16} stroke={2} color="var(--moeum-text-dim)" />
      </ActionIcon>
    </Group>
  );
}

/** 이번달 "YYYY-MM" 기본값 */
export const defaultYearMonth = currentYearMonthKst;
