"use client";

import { Box, Stack, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import EmptyText from "_features/common/components/empty-text";
import { InfiniteSentinel } from "_libraries/query/infinite-sentinel";

import type { TransactionFilterMode } from "../hooks/use-sub/use-search";
import { useAccountLedgerInfinite } from "../queries/use-query";
import { useQuickAddStore } from "../store";
import type { AccountLedgerItemType } from "../types";
import LedgerRow from "./ledger-row";

interface AccountLedgerViewProps {
  accountId: string;
  /** 거래 탭처럼 월별로 볼 때 — 그 달 거래만 + 그달말 기준 잔액 */
  year?: number;
  month?: number;
  /** txType 필터 — 잔액은 백엔드가 박아주므로 클라이언트에서 걸러도 행별 잔액은 정확 */
  filter?: TransactionFilterMode;
  /** 특정 날짜만("YYYY-MM-DD") — 데스크톱 레일 달력 선택 */
  date?: string | null;
  /** running balance 표시 여부 — INVESTMENT 는 매매현금이 빠져 부정확이라 숨긴다 */
  showBalance?: boolean;
}

const DOW_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

/**
 * 계좌별 거래 이력 — 날짜 헤더(모노 `09.11 목` + 헤어라인) + ListRow, 무한 스크롤.
 * Figma transactions 22:90 DateHeader 24:105. year/month 가 있으면 그 달 단위, 없으면 전체.
 */
export default function AccountLedgerView({
  accountId,
  year,
  month,
  filter = "all",
  date = null,
  showBalance = true,
}: AccountLedgerViewProps) {
  const tg = useTranslations("general.common");
  const tGeneral = useTranslations("general");
  const tTx = useTranslations("transaction");
  const tNav = useTranslations("nav");
  const openQuickAdd = useQuickAddStore((st) => st.open);

  const formatDate = (yyyymmdd: string): string => {
    const [y, m, d] = yyyymmdd.split("-").map(Number) as [number, number, number];
    const dayKey = DOW_KEYS[new Date(y, m - 1, d).getDay()] ?? "sun";
    return tTx("date_header", {
      month: String(m).padStart(2, "0"),
      day: String(d).padStart(2, "0"),
      weekday: tGeneral(`weekday.${dayKey}`),
    });
  };

  // 월 단위면 그 달 거래가 적어 한 번에(큰 limit), 전체면 무한 스크롤 30
  const isMonthly = year !== undefined && month !== undefined;
  const pageSize = isMonthly ? 500 : 30;

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useAccountLedgerInfinite(accountId, pageSize, year, month);

  const items: AccountLedgerItemType[] = useMemo(() => {
    const all = (data?.pages ?? []).flatMap((p) => p.body.data.items);
    return all.filter(
      (it) => (filter === "all" || it.txType === filter) && (!date || it.txDate.slice(0, 10) === date),
    );
  }, [data, filter, date]);

  // 일별 그룹화 — txDate "YYYY-MM-DD"
  const grouped = useMemo(() => {
    const map = new Map<string, AccountLedgerItemType[]>();
    for (const it of items) {
      const key = it.txDate.slice(0, 10);
      const arr = map.get(key) ?? [];
      arr.push(it);
      map.set(key, arr);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [items]);

  // 빈 결과여도 early return 하지 않는다 — 클라 필터(txType)로 현재 페이지에
  // 해당 거래가 없을 뿐 다음 페이지엔 있을 수 있으므로 sentinel 을 살려 둔다.
  return (
    <Stack gap={0}>
      {items.length === 0 ? (
        <EmptyText py={20} message={tg("no_data")} action={{ label: tNav("record_full"), onClick: () => openQuickAdd() }} />
      ) : (
        grouped.map(([date, txns]) => (
          <Box key={date}>
            <Stack gap={4} pt={14}>
              <Text
                className="moeum-mono moeum-label"
                fw={600}
                c="dimmed"
                style={{ textTransform: "uppercase" }}
              >
                {formatDate(date)}
              </Text>
              <Box h={1} bg="var(--moeum-hair)" />
            </Stack>
            {txns.map((tx, i) => (
              <LedgerRow
                key={tx.transactionId}
                t={tx}
                accountId={accountId}
                showBalance={showBalance}
                last={i === txns.length - 1}
              />
            ))}
          </Box>
        ))
      )}

      <InfiniteSentinel
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />
    </Stack>
  );
}
