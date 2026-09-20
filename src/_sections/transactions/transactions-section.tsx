"use client";

import { Box, SegmentedControl, Stack } from "@mantine/core";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import Hairline from "_features/common/components/hairline";
import MonthPicker from "_features/common/components/month-picker";
import PageTitle from "_features/common/components/page-title";
import AccountLedgerView from "_features/transaction/components/account-ledger-view";
import TransactionCalendarView from "_features/transaction/components/calendar-view";
import MonthTxListView from "_features/transaction/components/month-tx-list-view";
import {
  type TransactionViewMode,
  useTransactionSearch,
} from "_features/transaction/hooks/use-sub/use-search";
import { queryKeys } from "_constants/queries";

import CalendarRail from "./components/calendar-rail";
import ExpenseTop from "./components/expense-top";
import MonthSummary from "./components/month-summary";
import TransactionToolbar from "./components/transaction-toolbar";

/**
 * 거래 — 제목 + 목록/달력 세그 → 월 선택 → 요약 → 필터 → 날짜별 목록 (Figma transactions 22:90).
 * 데스크톱(lg): 좌 목록 + 우 레일(요약 + 달력, 날짜 클릭 = 그 날만). 세그는 모바일 전용.
 * 기록 추가는 셸의 `＋ 기록`(RecordFab) 이 담당 — 헤더 버튼 없음.
 */
export default function TransactionsSection() {
  const t = useTranslations("transaction");
  // 데스크톱 레일 달력에서 고른 날 — 목록 필터. 월이 바뀌면 의미 없으므로 함께 초기화
  const [railDate, setRailDate] = useState<string | null>(null);

  const {
    view,
    filter,
    month,
    year,
    monthNum,
    accountId,
    categoryId,
    setView,
    setFilter,
    setMonth,
    setAccountId,
    setCategoryId,
  } = useTransactionSearch();

  // INVESTMENT 통장은 매매현금이 ledger 밖이라 running balance 부정확 → 잔액 숨김.
  const { data: formOptions } = useSuspenseQuery(queryKeys.transaction.formOptions());
  const selectedAccount = formOptions.body.data.accounts.find((a) => a.accountId === accountId);
  const showBalance = selectedAccount?.accountType !== "INVESTMENT";
  // 삭제된 통장 id 가 URL 에 남아 있으면 ledger 가 404 를 던져 화면 전체가 죽는다 → 전체 통장으로.
  const effectiveAccountId = selectedAccount ? accountId : undefined;


  const toolbar = (
    <TransactionToolbar
      filter={filter}
      accountId={effectiveAccountId}
      onFilterChange={setFilter}
      onAccountChange={setAccountId}
    />
  );

  const ledger = (
    <>
      {toolbar}
      {effectiveAccountId ? (
        <AccountLedgerView
          accountId={effectiveAccountId}
          year={year}
          month={monthNum}
          filter={filter}
          date={railDate}
          categoryId={categoryId}
          showBalance={showBalance}
        />
      ) : (
        /* 전체 통장 — 잔액 대신 통장명. 우측 레일과 같은 calendarFull 응답을 본다 */
        <MonthTxListView
          year={year}
          month={monthNum}
          filter={filter}
          date={railDate}
          categoryId={categoryId}
        />
      )}
    </>
  );

  return (
    <div className="moeum-main-rail">
      <Stack gap={0}>
        <PageTitle title={t("list_title")}>
          <Box hiddenFrom="lg">
            <SegmentedControl
              value={view}
              onChange={(v) => setView(v as TransactionViewMode)}
              size="xs"
              data={[
                { value: "list", label: t("view_list") },
                { value: "calendar", label: t("view_calendar") },
              ]}
            />
          </Box>
        </PageTitle>

        <Box pt={8} pb={4} ml={-8}>
          <MonthPicker
            value={month}
            onChange={(m) => {
              setRailDate(null);
              setMonth(m);
            }}
          />
        </Box>

        {/* 이번 달 요약 — 모바일은 목록 위, 데스크톱은 우측 레일(같은 쿼리 키라 1회 조회) */}
        <Box hiddenFrom="lg">
          {/* 드릴다운은 목록 뷰에서만 — 모바일 달력 뷰엔 좁혀질 목록이 없어
              누르면 URL 만 바뀌고 화면은 그대로인 먹통 클릭이 된다 */}
          <MonthSummary
            year={year}
            month={monthNum}
            accountId={effectiveAccountId}
            selectedCategoryId={view === "list" ? categoryId : undefined}
            onSelectCategory={view === "list" ? setCategoryId : undefined}
          />
          <Hairline />
        </Box>

        {view === "list" ? (
          ledger
        ) : (
          <>
            {/* 달력 뷰에도 같은 툴바 — 뷰를 바꿨다고 통장 필터를 못 풀면 숫자가 또 어긋나 보인다 */}
            <Box hiddenFrom="lg">
              {toolbar}
              <TransactionCalendarView
                key={`${month}-${effectiveAccountId ?? "all"}`}
                year={year}
                month={monthNum}
                accountId={effectiveAccountId}
              />
            </Box>
            {/* 데스크톱은 달력이 레일에 있으므로 목록 고정 */}
            <Box visibleFrom="lg">{ledger}</Box>
          </>
        )}
      </Stack>

      {/* 데스크톱 레일: 요약 → 달력 → 지출 Top5(항상 펼침) */}
      <Box visibleFrom="lg" pt={48}>
        <MonthSummary year={year} month={monthNum} accountId={effectiveAccountId} showTop={false} />
        <CalendarRail
          year={year}
          month={monthNum}
          accountId={effectiveAccountId}
          selectedDate={railDate}
          onSelect={setRailDate}
        />
        <ExpenseTop
          year={year}
          month={monthNum}
          accountId={effectiveAccountId}
          selectedCategoryId={categoryId}
          onSelectCategory={setCategoryId}
        />
      </Box>
    </div>
  );
}
