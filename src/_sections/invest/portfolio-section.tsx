"use client";

import { ActionIcon, Box, Group, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconRefresh } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import AccentLink from "_features/common/components/accent-link";
import EmptyText from "_features/common/components/empty-text";
import Hairline from "_features/common/components/hairline";
import HeroAmount from "_features/common/components/hero-amount";
import PageTitle from "_features/common/components/page-title";
import ListRow from "_features/common/components/list-row";
import Section from "_features/common/components/section";
import StatGrid from "_features/common/components/stat-grid";
import StockShares from "_features/portfolio/components/stock-shares";
import TrendLine, { type TrendPoint } from "_features/common/components/trend-line";
import { usePortfolioMutations } from "_features/portfolio/queries/use-mutations";
import { usePortfolioOverview } from "_features/portfolio/queries/use-query";
import { usePortfolioSheetStore } from "_features/portfolio/store";
import { queryKeys } from "_constants/queries";
import { semanticColor, signColor } from "_styles/semantic-color";
import { todayIsoKst } from "_utilities/datetime";
import { fmt, fmtArrowPct, fmtSigned } from "_utilities/fmt";


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

  const trendPoints: TrendPoint[] = wealthRes.body.data.allocation.allocationTrend
    .map((p) => ({
      date: p.snapshotDate,
      value: p.slices.find((s) => s.assetClass === "INVESTMENT")?.valuation ?? 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  if (hasAccounts) {
    // KST 오늘 — toISOString 은 UTC 라 자정~09시에 전날로 찍힘
    trendPoints.push({ date: todayIsoKst(), value: summary.totalValuation });
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
          {/* 아이콘 히트 44 · 링크 좌패딩 12 가 간격을 채우므로 gap 은 최소 */}
          <Group gap={2} wrap="nowrap">
            {/* 히트 44(DESIGN 터치 44) — 세로 음수 마진으로 타이틀 행 높이는 그대로 */}
            <ActionIcon
              variant="subtle"
              color="gray"
              size={44}
              my={-5}
              onClick={handleRefresh}
              loading={refreshMutation.isPending}
              aria-label={t("refresh")}
            >
              <IconRefresh size={20} stroke={2} color="var(--moeum-text-dim)" />
            </ActionIcon>
            <AccentLink variant="header" onClick={() => openSheet()}>
              {t("add_stock")}
            </AccentLink>
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
                  style={{ fontSize: 14, lineHeight: "20px", color: semanticColor(signColor(summary.totalRate, "asset")) }}
                >
                  {fmtArrowPct(summary.totalRate)}
                </Text>
              }
            />
            <TrendLine points={trendPoints} periods showLast />
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
