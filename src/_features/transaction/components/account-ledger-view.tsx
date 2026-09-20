"use client";

import { Box, Stack } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import EmptyText from "_features/common/components/empty-text";
import { InfiniteSentinel } from "_libraries/query/infinite-sentinel";

import { useAccountLedgerInfinite } from "../queries/use-query";
import { useQuickAddStore } from "../store";
import type {
  AccountLedgerItemType,
  TransactionFilterMode,
} from "../types";
import { filterTxns, layoutTxns } from "../utils";
import LedgerRow from "./ledger-row";
import TxDateHeader from "./tx-date-header";

interface AccountLedgerViewProps {
  accountId: string;
  /** 거래 탭처럼 월별로 볼 때 — 그 달 거래만 + 그달말 기준 잔액 */
  year?: number;
  month?: number;
  /** txType 필터 — 잔액은 백엔드가 박아주므로 클라이언트에서 걸러도 행별 잔액은 정확 */
  filter?: TransactionFilterMode;
  /** 특정 날짜만("YYYY-MM-DD") — 데스크톱 레일 달력 선택 */
  date?: string | null;
  /** 카테고리 드릴다운 — 지출 Top5 에서 고른 카테고리. 있으면 금액순 평면 목록 */
  categoryId?: string;
  /** running balance 표시 여부 — INVESTMENT 는 매매현금이 빠져 부정확이라 숨긴다 */
  showBalance?: boolean;
}

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
  categoryId,
  showBalance = true,
}: AccountLedgerViewProps) {
  const tg = useTranslations("general.common");
  const tNav = useTranslations("nav");
  const openQuickAdd = useQuickAddStore((st) => st.open);

  // 월 단위면 그 달 거래가 적어 한 번에(큰 limit), 전체면 무한 스크롤 30
  const isMonthly = year !== undefined && month !== undefined;
  const pageSize = isMonthly ? 500 : 30;

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useAccountLedgerInfinite(accountId, pageSize, year, month);

  const items: AccountLedgerItemType[] = useMemo(() => {
    const all = (data?.pages ?? []).flatMap((p) => p.body.data.items);
    return filterTxns(all, { filter, date, categoryId });
  }, [data, filter, date, categoryId]);

  const layout = useMemo(() => layoutTxns(items, categoryId), [items, categoryId]);

  // 빈 결과여도 early return 하지 않는다 — 클라 필터(txType)로 현재 페이지에
  // 해당 거래가 없을 뿐 다음 페이지엔 있을 수 있으므로 sentinel 을 살려 둔다.
  return (
    <Stack gap={0}>
      {items.length === 0 ? (
        <EmptyText py={20} message={tg("no_data")} action={{ label: tNav("record_full"), onClick: () => openQuickAdd() }} />
      ) : layout.mode === "ranked" ? (
        /* 금액순에선 잔액을 숨긴다 — running balance 는 날짜 순서일 때만 읽히는 값이라
           금액순으로 깔면 오르락내리락해서 틀린 값처럼 보인다(전체 통장 목록과 같은 이유) */
        <Box pt={14}>
          {layout.rows.map((tx, i) => (
            <LedgerRow
              key={tx.transactionId}
              t={tx}
              accountId={accountId}
              showBalance={false}
              withDate
              last={i === layout.rows.length - 1}
            />
          ))}
        </Box>
      ) : (
        layout.groups.map(([day, txns]) => (
          <Box key={day}>
            <TxDateHeader date={day} />
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
