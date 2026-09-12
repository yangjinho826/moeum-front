"use client";

import { Box, Stack, Text } from "@mantine/core";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import EmptyText from "_features/common/components/empty-text";
import ListRow from "_features/common/components/list-row";
import Section from "_features/common/components/section";
import { usePortfolioOverview } from "_features/portfolio/queries/use-query";
import { topExpenseCategories } from "_features/stats/utils";
import { useQuickAddStore } from "_features/transaction/store";
import TxRow from "_features/transaction/components/tx-row";
import { queryKeys } from "_constants/queries";
import { chartColor, signColor } from "_styles/semantic-color";
import { fmt, fmtSigned, fmtSignedPct } from "_utilities/fmt";

import TotalAssetHero from "./components/total-asset-hero";

const pct = (n: number): string => `${n.toFixed(1)}%`;

/**
 * HomeSection — "결과 하나"(A) 홈 (plan/1.md, Figma home 10:3).
 * hero(총자산 + 추이) → 이번 달 늘어난 이유(순저축·투자손익) → 자산 구성 → 최근 기록.
 * 데스크톱은 우측 레일에 이번 달 · 지출 Top 3 · 투자 요약(handoff HomeDesktop).
 */
export default function HomeSection() {
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("home");
  const tAssetClass = useTranslations("enum.asset-class");
  const openQuickAdd = useQuickAddStore((st) => st.open);

  const now = new Date();
  const { data: homeRes } = useSuspenseQuery(
    queryKeys.home.overview({ year: now.getFullYear(), month: now.getMonth() + 1 }),
  );
  const { data: wealthRes } = useSuspenseQuery(queryKeys.wealth.overview({}));
  const { data: portfolioRes } = usePortfolioOverview();

  const home = homeRes.body.data;
  const stats = home.stats;
  const income = stats.monthlyIncome;
  const expense = stats.monthlyExpense;
  const netSaving = income - expense;
  const savingRate = income > 0 ? (netSaving / income) * 100 : 0;

  const summary = portfolioRes.body.data.summary;
  const hasInvestment = portfolioRes.body.data.investmentAccounts.length > 0;
  const profit = hasInvestment ? summary.totalProfit : 0;

  // 기여 막대 — 순저축·투자손익 절대값 합 대비
  const contribTotal = Math.abs(netSaving) + Math.abs(profit);
  const contrib = (v: number) => (contribTotal > 0 ? Math.abs(v) / contribTotal : 0);
  // 제목 방향은 hero 와 같은 기준(지난 기록 대비 총자산 증감). 투자손익은 누적 평가손익이라
  // 순저축+손익 부호로 판단하면 실제 증감과 어긋날 수 있음 (QA D-2). 기록이 없으면 순저축+손익
  const wealth = wealthRes.body.data;
  const lastSnapshot = wealth.yearlySnapshots.months.at(-1);
  const monthUp = lastSnapshot
    ? wealth.totalBalance - lastSnapshot.totalBalance >= 0
    : netSaving + profit >= 0;

  const allocation = [...wealthRes.body.data.allocation.currentAllocation].sort(
    (a, b) => b.valuation - a.valuation,
  );
  const expenseTop = topExpenseCategories(stats.byCategory, 3);
  const recent = home.recentTransactions.slice(0, 3);

  const whySection = (
    <Section
      title={monthUp ? t("why_up") : t("why_down")}
      link={{ label: t("why_detail"), href: `/${locale}/transactions` }}
    >
      <ListRow
        title={t("net_saving")}
        meta={
          <>
            <Text span inherit c="var(--moeum-income)">
              {t("income")} {fmt(income)}
            </Text>
            {" − "}
            <Text span inherit c="var(--moeum-expense)">
              {t("expense")} {fmt(expense)}
            </Text>
          </>
        }
        value={fmtSigned(netSaving)}
        bar={{ ratio: contrib(netSaving), color: "accent" }}
        last={!hasInvestment}
        href={`/${locale}/transactions`}
      />
      {hasInvestment && (
        <ListRow
          title={t("invest_profit")}
          meta={t("meta_valuation", {
            amount: fmt(summary.totalValuation),
            rate: fmtSignedPct(summary.totalRate),
          })}
          value={fmtSigned(profit)}
          valueColor={signColor(profit, "asset")}
          bar={{ ratio: contrib(profit), color: signColor(profit, "asset") }}
          last
          href={`/${locale}/invest`}
        />
      )}
    </Section>
  );

  const allocationSection = allocation.length > 0 && (
    <Section
      title={t("asset_allocation")}
      link={{ label: t("go_all_short"), href: `/${locale}/wealth` }}
    >
      {allocation.map((s, i) => (
        <ListRow
          key={s.assetClass}
          title={tAssetClass(s.assetClass)}
          value={fmt(s.valuation)}
          sub={`${Math.round(s.ratio)}%`}
          bar={{ ratio: s.ratio / 100, color: chartColor(i) }}
          last={i === allocation.length - 1}
          href={`/${locale}/wealth`}
        />
      ))}
    </Section>
  );

  const recentSection = (
    <Section
      title={t("recent_transactions")}
      link={{ label: t("go_all_short"), href: `/${locale}/transactions` }}
    >
      {recent.length === 0 ? (
        <EmptyText message={t("no_transactions")} action={{ label: t("record_now"), onClick: () => openQuickAdd() }} />
      ) : (
        recent.map((tx, i) => (
          <TxRow key={tx.transactionId} item={tx} withDate last={i === recent.length - 1} />
        ))
      )}
    </Section>
  );

  const rail = (
    <>
      <Section
        title={t("this_month")}
        hairline={false}
        link={{ label: t("go_transactions_all"), href: `/${locale}/transactions` }}
      >
        <ListRow title={t("income")} value={fmt(income)} valueColor="income" href={`/${locale}/transactions?filter=INCOME`} />
        <ListRow title={t("expense")} value={fmt(expense)} valueColor="expense" href={`/${locale}/transactions?filter=EXPENSE`} />
        <ListRow title={t("saving_rate")} value={pct(savingRate)} last href={`/${locale}/transactions`} />
      </Section>
      {expenseTop.length > 0 && (
        <Section title={t("expense_top")}>
          {expenseTop.map((c, i) => (
            <ListRow
              key={c.categoryId}
              title={c.name}
              dot={c.color}
              value={fmt(c.amount)}
              sub={expense > 0 ? `${Math.round((c.amount / expense) * 100)}%` : undefined}
              bar={{ ratio: expense > 0 ? c.amount / expense : 0, color: "expense" }}
              last={i === expenseTop.length - 1}
              href={`/${locale}/transactions?filter=EXPENSE`}
            />
          ))}
        </Section>
      )}
      {hasInvestment && (
        <Section title={t("invest")} link={{ label: t("go_invest_all"), href: `/${locale}/invest` }}>
          <ListRow title={t("valuation")} value={fmt(summary.totalValuation)} href={`/${locale}/invest`} />
          <ListRow
            title={t("profit_loss")}
            value={fmtSigned(profit)}
            valueColor={signColor(profit, "asset")}
            sub={fmtSignedPct(summary.totalRate)}
            last
            href={`/${locale}/invest`}
          />
        </Section>
      )}
    </>
  );

  return (
    <div className="moeum-main-rail">
      <Stack gap={0}>
        <TotalAssetHero />
        {whySection}
        {allocationSection}
        {recentSection}
      </Stack>
      <Box visibleFrom="lg">
        <Stack gap={0}>{rail}</Stack>
      </Box>
    </div>
  );
}
