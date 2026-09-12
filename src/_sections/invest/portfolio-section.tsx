"use client";

import { ActionIcon, Box, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconRefresh } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import EmptyText from "_features/common/components/empty-text";
import Hairline from "_features/common/components/hairline";
import HeroAmount from "_features/common/components/hero-amount";
import PageTitle from "_features/common/components/page-title";
import ListRow from "_features/common/components/list-row";
import Section from "_features/common/components/section";
import StatGrid from "_features/common/components/stat-grid";
import StockShares from "_features/portfolio/components/stock-shares";
import { usePortfolioMutations } from "_features/portfolio/queries/use-mutations";
import { usePortfolioOverview } from "_features/portfolio/queries/use-query";
import { usePortfolioSheetStore } from "_features/portfolio/store";
import { queryKeys } from "_constants/queries";
import { signColor } from "_styles/semantic-color";
import { fmt, fmtArrowPct, fmtSigned } from "_utilities/fmt";

import ValuationTrend, { type ValuationPoint } from "./components/valuation-trend";

/**
 * 투자 — 12개월 추이가 주인공(C) (plan/1.md, Figma invest 25:179).
 * 헤더(새로고침 · 종목 추가) → 컴팩트 hero(평가금액 + 수익률) → 추이 차트 + 기간 칩
 * → StatGrid(평가손익·매입·현금) → 계좌 52px 행 → 종목 비중 StockShares(데스크톱은 우측 레일).
 */
export default function PortfolioSection() {
  const t = useTranslations("portfolio");
  const { locale } = useParams<{ locale: string }>();
  const openSheet = usePortfolioSheetStore((s) => s.open);
  const { refreshMutation } = usePortfolioMutations();

  const { data } = usePortfolioOverview();
  const { summary, investmentAccounts } = data.body.data;
  // 월별 평가액 추이 = 자산군 배분 추이의 INVESTMENT 슬라이스 (홈과 같은 쿼리 키 → 캐시 공유)
  const { data: wealthRes } = useSuspenseQuery(queryKeys.wealth.overview({}));

  const handleRefresh = async () => {
    try {
      const res = await refreshMutation.mutateAsync();
      const fetched = res.body.data.fetched;
      notifications.show({
        message: fetched > 0 ? t("refresh_success", { count: fetched }) : t("refresh_empty"),
        color: "positive",
      });
    } catch {
      notifications.show({ message: t("refresh_failed"), color: "danger" });
    }
  };

  const hasAccounts = investmentAccounts.length > 0;
  const profit = summary.totalProfit;

  const trendPoints: ValuationPoint[] = wealthRes.body.data.allocation.allocationTrend
    .map((p) => ({
      date: p.snapshotDate,
      value: p.slices.find((s) => s.assetClass === "INVESTMENT")?.valuation ?? 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  if (hasAccounts) {
    trendPoints.push({ date: new Date().toISOString().slice(0, 10), value: summary.totalValuation });
  }

  // 종목 비중 — 전체 활성 종목 + 현금 (StockShares 가 정렬·상위 4·외 N·막대)
  const sharesSection = (
    <StockShares
      stocks={investmentAccounts.flatMap((g) => g.portfolios).filter((p) => !p.isArchived)}
      cash={summary.totalCash}
    />
  );

  return (
    <div className="moeum-main-rail">
      <Stack gap={0}>
        <PageTitle title={t("title")}>
          <Group gap={14} wrap="nowrap">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              onClick={handleRefresh}
              loading={refreshMutation.isPending}
              aria-label={t("refresh")}
            >
              <IconRefresh size={20} stroke={2} color="var(--moeum-text-dim)" />
            </ActionIcon>
            <UnstyledButton
              onClick={() => openSheet()}
              style={{ fontSize: 13, lineHeight: "19px", fontWeight: 700, color: "var(--moeum-accent)", padding: "8px 0", margin: "-8px 0" }}
            >
              {t("add_stock")}
            </UnstyledButton>
          </Group>
        </PageTitle>

        {hasAccounts ? (
          <>
            <HeroAmount
              compact
              label={t("valuation_amount")}
              amount={summary.totalValuation}
              amountRight={
                <Text
                  className="moeum-mono"
                  fw={600}
                  style={{ fontSize: 14, lineHeight: "20px", color: semanticColorFor(summary.totalRate) }}
                >
                  {fmtArrowPct(summary.totalRate)}
                </Text>
              }
            />
            <ValuationTrend points={trendPoints} />
            <Hairline />
            <StatGrid
              items={[
                { label: t("profit_label"), value: fmtSigned(profit), color: signColor(profit, "asset") },
                { label: t("buy_cost"), value: fmt(summary.totalCost) },
                { label: t("cash_label"), value: fmt(summary.totalCash) },
              ]}
            />
            <Section title={t("accounts")} link={{ label: t("go_all"), href: `/${locale}/wealth` }}>
              {investmentAccounts.map(({ account, portfolios }, i) => {
                const rate = account.portfolioProfitLossRate ?? 0;
                return (
                  <ListRow
                    key={account.accountId}
                    tall
                    chevron
                    title={account.name}
                    meta={t("account_meta", {
                      count: portfolios.filter((p) => !p.isArchived).length,
                      cash: fmt(account.cash ?? 0),
                    })}
                    value={fmt(account.balance)}
                    sub={fmtArrowPct(rate)}
                    subColor={signColor(rate, "asset")}
                    last={i === investmentAccounts.length - 1}
                    href={`/${locale}/invest/account/${account.accountId}`}
                  />
                );
              })}
            </Section>
            <Box hiddenFrom="lg">{sharesSection}</Box>
          </>
        ) : (
          // 빈 상태 — 계좌 0
          <EmptyText py={20} message={t("empty_invest")} action={{ label: t("add_account"), href: `/${locale}/wealth` }} />
        )}
      </Stack>
      {hasAccounts && (
        <Box visibleFrom="lg" pt={48}>
          {sharesSection}
        </Box>
      )}
    </div>
  );
}

/** 수익률 부호색 (0 = dim) */
const semanticColorFor = (rate: number): string =>
  `var(--moeum-${rate > 0 ? "up" : rate < 0 ? "down" : "text-dim"})`;
