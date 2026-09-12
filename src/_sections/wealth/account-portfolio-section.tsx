"use client";

import { Box, Center, Loader, Stack } from "@mantine/core";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense, useMemo } from "react";

import DeltaPill from "_features/common/components/delta-pill";
import EmptyText from "_features/common/components/empty-text";
import HeroAmount from "_features/common/components/hero-amount";
import ListRow from "_features/common/components/list-row";
import Section from "_features/common/components/section";
import StatGrid from "_features/common/components/stat-grid";
import SubHeader from "_features/layout/components/sub-header";
import StockShares from "_features/portfolio/components/stock-shares";
import { useAccountOverview } from "_features/portfolio/queries/use-query";
import { usePortfolioSheetStore } from "_features/portfolio/store";
import AccountBalanceTrend from "_sections/wealth/components/account-balance-trend";
import RealizedPnlRail from "_sections/wealth/components/realized-pnl-rail";
import { signColor } from "_styles/semantic-color";
import { fmt, fmtArrowPct, fmtSigned } from "_utilities/fmt";

interface Props {
  accountId: string;
}

/**
 * 투자 계좌 상세 — 명세서 배치 (plan/2.md, Figma 41:365).
 * 모바일: hero(계좌 총액 + 평가손익) → StatGrid(현금·평가·종목) → 자산 추이 → 종목 비중(StockShares)
 * → 누적 매매수익 행 → 보유 종목 ListRow. 데스크톱: 좌 판면(hero·StatGrid·추이·보유 종목) + 우 레일(비중·매매수익).
 */
export default function AccountPortfolioSection({ accountId }: Props) {
  const t = useTranslations("portfolio");
  const tGeneral = useTranslations("general");
  const tMarket = useTranslations("enum.market");
  const { locale } = useParams<{ locale: string }>();
  const openSheet = usePortfolioSheetStore((s) => s.open);

  const { data } = useAccountOverview(accountId);
  const account = data.body.data.account;
  // 백엔드 응답에 isArchived 포함 — 활성 종목만 노출
  const portfolios = useMemo(() => data.body.data.portfolios.filter((p) => !p.isArchived), [data]);

  // 백엔드가 통장 balance = cash + portfolio_valuation 으로 합산해서 내려줌
  const cash = account.cash ?? 0;
  const valuation = account.portfolioValuation ?? 0;
  const profitLoss = account.portfolioProfitLoss ?? 0;
  const profitLossRate = account.portfolioProfitLossRate ?? 0;

  // 종목 비중 + 누적 매매수익 — 모바일은 판면 중간, 데스크톱은 우측 레일
  const rail = (
    <>
      {/* 종목 비중 — 투자 메인과 같은 구성 막대 + 색 점 행 */}
      <StockShares stocks={portfolios} cash={cash} />
      {/* 누적 매매수익 — 얇은 행, 탭하면 시트 (전량매도된 종목 포함) */}
      <Suspense fallback={null}>
        <RealizedPnlRail accountId={accountId} />
      </Suspense>
    </>
  );

  return (
    <div className="moeum-main-rail">
      <Stack gap={0}>
        <SubHeader title={account.name} />

        <HeroAmount compact label={t("account_total")} amount={account.balance}>
          <DeltaPill size="sm" value={profitLoss} variant="asset" rate={profitLossRate} caption={t("profit_label")} />
        </HeroAmount>

        <StatGrid
          items={[
            { label: t("cash_label"), value: fmt(cash) },
            { label: t("meta_valuation"), value: fmt(valuation) },
            { label: t("meta_stock_count"), value: tGeneral("unit.count", { count: portfolios.length }) },
          ]}
        />

        {/* 통장 전체 자산 추이 */}
        <Suspense
          fallback={
            <Center py="md">
              <Loader size="sm" />
            </Center>
          }
        >
          <AccountBalanceTrend accountId={accountId} />
        </Suspense>

        <Box hiddenFrom="lg">{rail}</Box>

        <Section
          title={t("holdings")}
          link={{ label: `+ ${t("add_stock")}`, onClick: () => openSheet(undefined, accountId) }}
        >
          {portfolios.length === 0 ? (
            <EmptyText
              message={t("empty_holdings")}
              action={{ label: t("add_stock"), onClick: () => openSheet(undefined, accountId) }}
            />
          ) : (
            portfolios.map((p, i) => {
              const cost = p.quantity * p.avgPrice;
              const profit = p.currentValue - cost;
              const rate = cost > 0 ? (profit / cost) * 100 : 0;
              return (
                <ListRow
                  key={p.portfolioId}
                  tall
                  chevron
                  title={p.name}
                  meta={`${p.code} · ${tMarket(p.market)} · ${tGeneral("unit.stock", { count: p.quantity })} · ${t("avg_short")} ${fmt(p.avgPrice)}`}
                  value={fmt(p.currentValue)}
                  sub={`${fmtSigned(profit)} (${fmtArrowPct(rate)})`}
                  subColor={signColor(profit, "asset")}
                  last={i === portfolios.length - 1}
                  href={`/${locale}/invest/portfolio/${p.portfolioId}`}
                />
              );
            })
          )}
        </Section>
      </Stack>
      <Box visibleFrom="lg" pt={48}>
        {rail}
      </Box>
    </div>
  );
}
