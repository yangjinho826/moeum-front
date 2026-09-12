"use client";

import { Box, Stack, Text } from "@mantine/core";
import { useTranslations } from "next-intl";

import { LEDGER_ACCOUNT_TYPES } from "_features/account/constants";
import { useAccountReport } from "_features/account/queries/use-query";
import { useAccountSheetStore } from "_features/account/store";
import AccentLink from "_features/common/components/accent-link";
import DeltaPill from "_features/common/components/delta-pill";
import HeroAmount from "_features/common/components/hero-amount";
import ListRow from "_features/common/components/list-row";
import Section from "_features/common/components/section";
import SectionBoundary from "_features/common/components/section-boundary";
import SectionSkeleton from "_features/common/components/section-skeleton";
import StatGrid from "_features/common/components/stat-grid";
import SubHeader from "_features/layout/components/sub-header";
import AccountLedgerView from "_features/transaction/components/account-ledger-view";
import AccountBalanceTrend from "_sections/wealth/components/account-balance-trend";
import { fmt } from "_utilities/fmt";

interface Props {
  accountId: string;
}

/**
 * 통장 상세 — 명세서 배치 (plan/3.md, Figma 58:383).
 * 모바일: hero(현재 잔액 + 지난달 대비) → StatGrid(이번 달 수입·지출·고정지출) → 잔액 추이 → 거래 내역.
 * 데스크톱: 좌 판면(hero·추이·거래 내역) + 우 레일("이번 달" 3행). 월별 수입·지출 막대는 잔액 추이와 중복이라 두지 않는다(배치3 S3 결정).
 */
export default function AccountReportSection({ accountId }: Props) {
  const openAccountSheet = useAccountSheetStore((s) => s.open);
  const t = useTranslations("account");
  const tTx = useTranslations("transaction");
  const tHome = useTranslations("home");
  const tg = useTranslations("general.common");
  const { data } = useAccountReport(accountId);
  const report = data.body.data;
  const showLedger = LEDGER_ACCOUNT_TYPES.has(report.accountType);

  // monthlyFlows 마지막 = 이번 달(balance = 현재 잔액), 그 앞 = 지난달 말 잔액
  const flows = report.monthlyFlows;
  const thisMonth = flows[flows.length - 1];
  const lastMonth = flows[flows.length - 2];
  const delta = lastMonth ? report.balance - lastMonth.balance : null;
  const deltaRate =
    lastMonth && delta !== null && lastMonth.balance !== 0
      ? (delta / Math.abs(lastMonth.balance)) * 100
      : null;

  const income = thisMonth?.income ?? 0;
  const expense = thisMonth?.expense ?? 0;
  const fixedExpense = thisMonth?.fixedExpense ?? 0;

  return (
    <div className="moeum-main-rail">
      <Stack gap={0}>
        <SubHeader
          title={report.accountName}
          right={
            <AccentLink variant="header" onClick={() => openAccountSheet(accountId)}>
              {tg("update")}
            </AccentLink>
          }
        />

        <HeroAmount compact label={t("current_balance")} amount={report.balance}>
          {/* 잔액 증감 = 자산 방향(▲▼ up/down) — 잔액 추이 캡션과 같은 규칙 (DESIGN §2-3). 0 이면 "0 0.0%" 대신 문장 */}
          {delta !== null &&
            (delta === 0 ? (
              <Text fz={13} c="dimmed">
                {t("same_as_last_month")}
              </Text>
            ) : (
              <DeltaPill size="sm" value={delta} variant="asset" rate={deltaRate} caption={t("vs_last_month")} />
            ))}
        </HeroAmount>

        <Box hiddenFrom="lg">
          <StatGrid
            items={[
              { label: t("this_month_income"), value: fmt(income), color: "income" },
              { label: tTx("summary_expense"), value: fmt(expense), color: "expense" },
              { label: t("fixed_expense"), value: fmt(fixedExpense), color: "expense" },
            ]}
          />
        </Box>

        {/* 박제 2개월 미만이면 컴포넌트가 스스로 숨긴다. 조회 실패는 이 섹션만 "다시 시도" */}
        <SectionBoundary title={t("balance_trend")} loading={<SectionSkeleton chart />}>
          <AccountBalanceTrend accountId={accountId} title={t("balance_trend")} />
        </SectionBoundary>

        {/* 거래 이력 — 행마다 running balance. 거래계좌(생활·적립·기타)만 */}
        {showLedger && (
          <Section title={t("ledger")}>
            <AccountLedgerView accountId={accountId} />
          </Section>
        )}
      </Stack>

      <Box visibleFrom="lg" pt={48}>
        <Section title={tHome("this_month")}>
          <ListRow title={tTx("summary_income")} value={fmt(income)} valueColor="income" />
          <ListRow title={tTx("summary_expense")} value={fmt(expense)} valueColor="expense" />
          <ListRow title={t("fixed_expense")} value={fmt(fixedExpense)} valueColor="expense" last />
        </Section>
      </Box>
    </div>
  );
}
