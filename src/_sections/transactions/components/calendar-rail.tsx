"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import Section from "_features/common/components/section";
import MonthCalendar from "_features/transaction/components/month-calendar";
import { queryKeys } from "_constants/queries";

interface CalendarRailProps {
  year: number;
  month: number;
  selectedDate: string | null;
  onSelect: (date: string | null) => void;
}

/**
 * 데스크톱 우측 레일 달력 — 날짜를 고르면 좌측 목록이 그 날만 보여준다(handoff TransactionsDesktop).
 * 헤더 링크 "전체" 로 선택 해제.
 */
export default function CalendarRail({ year, month, selectedDate, onSelect }: CalendarRailProps) {
  const t = useTranslations("transaction");
  const { data } = useSuspenseQuery(queryKeys.transaction.calendarFull({ year, month }));

  return (
    <Section
      title={t("view_calendar")}
      link={selectedDate ? { label: t("filter_all"), onClick: () => onSelect(null) } : undefined}
    >
      <MonthCalendar
        year={year}
        month={month}
        days={data.body.data.days}
        selectedDate={selectedDate}
        onSelect={(d) => onSelect(d === selectedDate ? null : d)}
      />
    </Section>
  );
}
