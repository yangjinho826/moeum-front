"use client";

import { Stack, Text } from "@mantine/core";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { queryKeys } from "_constants/queries";
import { todayIso } from "_utilities/fmt";

import EmptyText from "_features/common/components/empty-text";

import { useQuickAddStore } from "../store";
import MonthCalendar from "./month-calendar";
import TxRow from "./tx-row";

interface CalendarViewProps {
  year: number;
  month: number;
}

/**
 * 모바일 달력 뷰 — 달력 그리드 + 선택일 거래 목록. calendarFull 1호출(일별 합계 + 그달 거래).
 * 월 변경은 부모(transactions-section) 가 key={month} 로 리마운트 → selectedDate 는 init state 로 충분.
 * 데스크톱은 목록 + 우측 레일 달력(calendar-rail) 이라 이 뷰를 쓰지 않는다.
 */
export default function TransactionCalendarView({ year, month }: CalendarViewProps) {
  const tGeneral = useTranslations("general");
  const tNav = useTranslations("nav");
  const openQuickAdd = useQuickAddStore((st) => st.open);
  const tTx = useTranslations("transaction");
  const today = todayIso();
  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;

  const [selectedDate, setSelectedDate] = useState<string>(() =>
    today.startsWith(monthPrefix) ? today : `${monthPrefix}-01`,
  );

  const { data: fullData } = useSuspenseQuery(queryKeys.transaction.calendarFull({ year, month }));
  const calendar = fullData.body.data;
  const selectedTx = calendar.transactions.filter((it) => it.txDate.slice(0, 10) === selectedDate);

  return (
    <Stack gap={0}>
      <MonthCalendar
        year={year}
        month={month}
        days={calendar.days}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
      />
      <Text fw={700} pt={14} pb={4} style={{ fontSize: 14, lineHeight: "20px" }}>
        {tTx("date_tx", {
          month: Number(selectedDate.slice(5, 7)),
          day: Number(selectedDate.slice(8, 10)),
        })}
      </Text>
      {selectedTx.length === 0 ? (
        <EmptyText message={tGeneral("empty")} action={{ label: tNav("record_full"), onClick: () => openQuickAdd() }} />
      ) : (
        selectedTx.map((tx, i) => (
          <TxRow key={tx.transactionId} item={tx} last={i === selectedTx.length - 1} />
        ))
      )}
    </Stack>
  );
}
