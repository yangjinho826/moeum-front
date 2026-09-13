"use client";

import { SimpleGrid, Stack, Text, UnstyledButton } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { todayIso } from "_utilities/fmt";

import type { TransactionCalendarDay } from "../types";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

interface MonthCalendarProps {
  year: number;
  month: number;
  /** calendarFull 의 일별 합계 */
  days: TransactionCalendarDay[];
  /** "YYYY-MM-DD" · null = 선택 없음 */
  selectedDate: string | null;
  onSelect: (date: string) => void;
}

/**
 * 월 달력 그리드 — 카드 없이 hair-2 위아래 선, 셀에 ±만원 모노 11 (plan/1.md ④').
 * 선택일 = accent 배경 + on-accent, 오늘 = surface-2. 요일색은 쓰지 않는다(수입·지출 색과 충돌).
 * 거래 탭 모바일 달력 뷰와 데스크톱 우측 레일이 공용.
 */
export default function MonthCalendar({ year, month, days, selectedDate, onSelect }: MonthCalendarProps) {
  const tGeneral = useTranslations("general");
  const today = todayIso();
  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;

  const dayStats = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);

  // 앞 빈칸 + 1~daysInMonth + 뒷 빈칸
  const cells = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const arr: (number | null)[] = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [year, month]);

  return (
    <SimpleGrid
      cols={7}
      spacing={2}
      py={8}
      style={{ borderTop: "1px solid var(--moeum-hair-2)", borderBottom: "1px solid var(--moeum-hair-2)" }}
    >
      {DAY_KEYS.map((dayKey) => (
        <Text
          key={dayKey}
          className="moeum-mono"
          size="10px"
          fw={600}
          ta="center"
          c="dimmed"
          py={4}
        >
          {tGeneral(`weekday.${dayKey}`)}
        </Text>
      ))}
      {cells.map((day, idx) => {
        if (day === null) return <div key={`pad-${idx}`} />;
        const date = `${monthPrefix}-${String(day).padStart(2, "0")}`;
        const stat = dayStats.get(date);
        const isSelected = selectedDate === date;
        const isToday = date === today;
        const dow = idx % 7;
        const dayColor = dow === 0 || dow === 6 ? "var(--moeum-text-dim)" : "var(--moeum-text)";
        const amountColor = (fallback: string) => (isSelected ? "var(--moeum-on-accent)" : fallback);
        return (
          <UnstyledButton
            key={date}
            onClick={() => onSelect(date)}
            aria-pressed={isSelected}
            style={{
              aspectRatio: "1 / 1",
              borderRadius: "var(--mantine-radius-md)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              background: isSelected ? "var(--moeum-accent)" : isToday ? "var(--moeum-surface-2)" : "transparent",
              transition: "background 150ms ease-out",
            }}
          >
            <Text className="moeum-mono" size="xs" fw={700} style={{ color: amountColor(dayColor) }}>
              {day}
            </Text>
            {stat && (
              <Stack gap={0} align="center">
                {stat.income > 0 && (
                  <Text className="moeum-mono" size="10px" fw={600} c={amountColor("var(--moeum-income)")}>
                    +{tGeneral("unit.man", { value: Math.round(stat.income / 10000) })}
                  </Text>
                )}
                {stat.expense > 0 && (
                  <Text className="moeum-mono" size="10px" fw={600} c={amountColor("var(--moeum-expense)")}>
                    -{tGeneral("unit.man", { value: Math.round(stat.expense / 10000) })}
                  </Text>
                )}
              </Stack>
            )}
          </UnstyledButton>
        );
      })}
    </SimpleGrid>
  );
}
