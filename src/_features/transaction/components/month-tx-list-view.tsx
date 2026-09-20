"use client";

import { Box, Stack } from "@mantine/core";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import EmptyText from "_features/common/components/empty-text";
import { queryKeys } from "_constants/queries";

import { useQuickAddStore } from "../store";
import type { TransactionFilterMode } from "../types";
import { filterTxns, layoutTxns } from "../utils";
import TxDateHeader from "./tx-date-header";
import TxRow from "./tx-row";

interface MonthTxListViewProps {
  year: number;
  month: number;
  /** txType 필터 — 툴바 칩 */
  filter?: TransactionFilterMode;
  /** 특정 날짜만("YYYY-MM-DD") — 데스크톱 레일 달력 선택 */
  date?: string | null;
  /** 카테고리 드릴다운 — 지출 Top5 에서 고른 카테고리. 있으면 금액순 평면 목록 */
  categoryId?: string;
}

/**
 * 전체 통장 월 거래 목록 — 통장을 안 고른 기본 상태의 좌측 목록.
 *
 * 우측 레일(요약·달력·Top5)과 **같은 calendarFull 응답**을 본다. 데스크톱에선 CalendarRail 이
 * 이미 같은 키를 조회하므로 캐시를 공유하고, 좌우가 한 응답을 쓰니 숫자가 어긋날 수 없다.
 * 잔액은 통장 단위로만 정의되는 값이라 여기선 안 보여준다 — 대신 TxRow 메타에 통장명.
 */
export default function MonthTxListView({
  year,
  month,
  filter = "all",
  date = null,
  categoryId,
}: MonthTxListViewProps) {
  const tg = useTranslations("general.common");
  const tNav = useTranslations("nav");
  const openQuickAdd = useQuickAddStore((st) => st.open);

  const { data } = useSuspenseQuery(
    queryKeys.transaction.calendarFull({ year, month }),
  );

  const items = useMemo(
    () => filterTxns(data.body.data.transactions, { filter, date, categoryId }),
    [data, filter, date, categoryId],
  );
  const layout = useMemo(() => layoutTxns(items, categoryId), [items, categoryId]);

  if (items.length === 0) {
    return (
      <EmptyText
        py={20}
        message={tg("no_data")}
        action={{ label: tNav("record_full"), onClick: () => openQuickAdd() }}
      />
    );
  }

  if (layout.mode === "ranked") {
    return (
      <Stack gap={0} pt={14}>
        {layout.rows.map((tx, i) => (
          <TxRow
            key={tx.transactionId}
            item={tx}
            withDate
            last={i === layout.rows.length - 1}
          />
        ))}
      </Stack>
    );
  }

  return (
    <Stack gap={0}>
      {layout.groups.map(([day, txns]) => (
        <Box key={day}>
          <TxDateHeader date={day} />
          {txns.map((tx, i) => (
            <TxRow key={tx.transactionId} item={tx} last={i === txns.length - 1} />
          ))}
        </Box>
      ))}
    </Stack>
  );
}
