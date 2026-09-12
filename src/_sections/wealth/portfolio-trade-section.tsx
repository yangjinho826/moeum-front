"use client";

import { Box, Button, Center, Loader, SimpleGrid, Stack, Text, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { queryKeys } from "_constants/queries";
import DeltaPill from "_features/common/components/delta-pill";
import EmptyText from "_features/common/components/empty-text";
import FormSheet from "_features/common/components/form-sheet";
import Hairline from "_features/common/components/hairline";
import HeroAmount from "_features/common/components/hero-amount";
import ListRow from "_features/common/components/list-row";
import Section from "_features/common/components/section";
import StatGrid from "_features/common/components/stat-grid";
import SubHeader from "_features/layout/components/sub-header";
import TradeForm from "_features/portfolio/components/trade-form";
import {
  usePortfolioItem,
  usePortfolioItemTransactionsInfinite,
} from "_features/portfolio/queries/use-query";
import { usePortfolioSheetStore } from "_features/portfolio/store";
import PortfolioValueTrend from "_sections/wealth/components/portfolio-value-trend";
import { InfiniteSentinel } from "_libraries/query/infinite-sentinel";
import type {
  PortfolioTransactionItemType,
  PortfolioTxType,
} from "_features/portfolio/types";
import { semanticColor, signColor } from "_styles/semantic-color";
import { fmt, fmtSigned } from "_utilities/fmt";

const DOW_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

/**
 * 종목 상세(매매) — 명세서 배치 (plan/2.md, Figma 45:130).
 * 모바일: ‹ 종목명 · 수정 → hero(평가금액 + 평가손익) → StatGrid(수량·평단·현재가) → 평가액 추이(+기간 칩)
 * → 매수/매도 outline 2열 → 매매 내역(날짜 헤더 + 행). 데스크톱: 우 레일에 매수/매도 + 매입금액.
 */

interface Props {
  portfolioId: string;
}

export default function PortfolioTradeSection({ portfolioId }: Props) {
  const t = useTranslations("portfolio");
  const tGeneral = useTranslations("general");
  const tg = useTranslations("general.common");
  const tTx = useTranslations("transaction");
  const tMarket = useTranslations("enum.market");
  const router = useRouter();
  const routeParams = useParams<{ locale: string }>();
  const queryClient = useQueryClient();
  const openPortfolioSheet = usePortfolioSheetStore((s) => s.open);

  const { data: itemData } = usePortfolioItem(portfolioId);
  const portfolio = itemData.body.data;

  // 수정 시트에서 삭제(archive)하면 시트만 닫혀 archive 된 종목 상세에 잔류 →
  // archive 감지 시 계좌로 복귀(어디서 archive 했든 일관 처리).
  useEffect(() => {
    if (portfolio.isArchived) {
      router.replace(
        `/${routeParams.locale}/invest/account/${portfolio.accountId}`,
      );
    }
  }, [portfolio.isArchived, portfolio.accountId, routeParams.locale, router]);

  const {
    data: txPages,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = usePortfolioItemTransactionsInfinite(portfolioId, 30);

  const trades: PortfolioTransactionItemType[] = useMemo(
    () => (txPages?.pages ?? []).flatMap((p) => p.body.data.items),
    [txPages],
  );

  const [opened, { open, close }] = useDisclosure(false);
  const [initialType, setInitialType] = useState<PortfolioTxType>("BUY");
  const [editingTx, setEditingTx] =
    useState<PortfolioTransactionItemType | null>(null);

  const openTrade = (type: PortfolioTxType) => {
    setEditingTx(null);
    setInitialType(type);
    open();
  };

  const handleEditPortfolio = () => {
    openPortfolioSheet(portfolio.portfolioId);
  };

  const handleCloseModal = () => {
    setEditingTx(null);
    close();
  };

  // 전량 매도면 이 종목은 soft delete 됨 → detail 쿼리 정리(404 refetch 화면깨짐 방지) 후 계좌로 복귀
  const handleTradeSuccess = async (soldOut?: boolean) => {
    if (soldOut) {
      await queryClient.cancelQueries({
        queryKey: queryKeys.portfolio.item(portfolioId).queryKey,
      });
      queryClient.removeQueries({
        queryKey: queryKeys.portfolio.item(portfolioId).queryKey,
      });
      router.replace(
        `/${routeParams.locale}/invest/account/${portfolio.accountId}`,
      );
      return;
    }
    handleCloseModal();
  };

  // 매매 내역 날짜 헤더 "08.21 목" — 거래 목록(account-ledger-view)과 같은 표기
  const formatDate = (yyyymmdd: string): string => {
    const [y, m, d] = yyyymmdd.slice(0, 10).split("-").map(Number) as [number, number, number];
    const dayKey = DOW_KEYS[new Date(y, m - 1, d).getDay()] ?? "sun";
    return tTx("date_header", {
      month: String(m).padStart(2, "0"),
      day: String(d).padStart(2, "0"),
      weekday: tGeneral(`weekday.${dayKey}`),
    });
  };

  // 날짜별 묶음(목록은 이미 최신순)
  const grouped = useMemo(() => {
    const map = new Map<string, PortfolioTransactionItemType[]>();
    for (const tx of trades) {
      const key = tx.txDate.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(tx);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [trades]);

  const canSell = portfolio.quantity > 0;
  const tradeButtons = (
    <SimpleGrid cols={2} spacing={12}>
      <Button variant="default" onClick={() => openTrade("BUY")} c={semanticColor("up")}>
        {t("trade_buy")}
      </Button>
      <Button variant="default" onClick={() => openTrade("SELL")} disabled={!canSell} c={semanticColor("down")}>
        {t("trade_sell")}
      </Button>
    </SimpleGrid>
  );

  const editLinkStyle = {
    fontSize: 13,
    lineHeight: "19px",
    fontWeight: 700,
    color: "var(--moeum-accent)",
    padding: "8px 0 8px 12px",
    margin: "-8px 0",
    flexShrink: 0,
  } as const;

  return (
    <div className="moeum-main-rail">
      <Stack gap={0}>
        <SubHeader
          title={portfolio.name}
          right={
            <UnstyledButton onClick={handleEditPortfolio} style={editLinkStyle}>
              {tg("update")}
            </UnstyledButton>
          }
        />

        <HeroAmount
          compact
          label={
            <>
              {t("valuation_amount")}{" "}
              <Text component="span" className="moeum-mono" fw={600} c="dimmed" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
                {portfolio.code} · {tMarket(portfolio.market)}
              </Text>
            </>
          }
          amount={portfolio.currentValue}
        >
          <DeltaPill
            size="sm"
            value={portfolio.profitLoss}
            variant="asset"
            rate={portfolio.profitLossRate}
            caption={t("profit_label")}
          />
        </HeroAmount>

        <StatGrid
          items={[
            { label: t("holding_qty"), value: tGeneral("unit.stock", { count: portfolio.quantity }) },
            { label: t("avg_unit_price"), value: fmt(portfolio.avgPrice) },
            { label: t("current_price"), value: fmt(portfolio.currentPrice) },
          ]}
        />

        {/* 평가액 추이 + 기간 칩 */}
        <Suspense
          fallback={
            <Center py="md">
              <Loader size="sm" />
            </Center>
          }
        >
          <PortfolioValueTrend portfolioId={portfolioId} currentValue={portfolio.currentValue} />
        </Suspense>

        {/* 매수 / 매도 — 모바일은 판면, 데스크톱은 우측 레일 */}
        <Box hiddenFrom="lg">
          <Hairline />
          {tradeButtons}
        </Box>

        {/* 매매 내역 (매매손익 누적은 계좌 상세 — 전량매도 시 종목이 사라져도 추적 가능) */}
        <Section title={t("transactions")}>
          {trades.length === 0 ? (
            <EmptyText
              message={t("first_trade_empty")}
              action={{ label: t("trade_buy"), onClick: () => openTrade("BUY") }}
            />
          ) : (
            <>
              {grouped.map(([date, txs]) => (
                <Box key={date}>
                  <Text
                    className="moeum-mono"
                    fw={600}
                    c="dimmed"
                    pt={10}
                    pb={2}
                    style={{ fontSize: 11, lineHeight: "16px", letterSpacing: "0.06em", textTransform: "uppercase" }}
                  >
                    {formatDate(date)}
                  </Text>
                  {txs.map((tx, i) => {
                    const isBuy = tx.ptType === "BUY";
                    const meta = [
                      `${tGeneral("unit.stock", { count: tx.quantity })} × ${fmt(tx.price)}`,
                      tx.realizedPnl != null ? `${t("realized_pnl")} ${fmtSigned(tx.realizedPnl)}` : null,
                      tx.memo,
                    ]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <ListRow
                        key={tx.txId}
                        tall
                        title={
                          <Text component="span" inherit style={{ color: semanticColor(isBuy ? "up" : "down") }}>
                            {isBuy ? t("trade_buy") : t("trade_sell")}
                          </Text>
                        }
                        meta={meta}
                        value={fmt(tx.total)}
                        sub={tx.realizedPnl != null ? fmtSigned(tx.realizedPnl) : undefined}
                        subColor={tx.realizedPnl != null ? signColor(tx.realizedPnl, "asset") : undefined}
                        last={i === txs.length - 1}
                        onClick={() => {
                          setEditingTx(tx);
                          open();
                        }}
                      />
                    );
                  })}
                </Box>
              ))}
              <InfiniteSentinel
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onLoadMore={fetchNextPage}
              />
            </>
          )}
        </Section>
      </Stack>

      {/* 데스크톱 레일 — 매수/매도 + 매입금액 */}
      <Box visibleFrom="lg" pt={48}>
        <Hairline />
        {tradeButtons}
        <Box pt={12}>
          <ListRow
            title={t("buy_cost_label")}
            value={fmt(portfolio.quantity * portfolio.avgPrice)}
            last
          />
        </Box>
      </Box>

      {/* 거래 추가 시트(quick-add-sheet) 와 동일 패턴 — FormSheet 이 BottomTab
          높이 보정(maxHeight/paddingBottom)까지 처리한다. */}
      <FormSheet
        opened={opened}
        onClose={handleCloseModal}
        title={
          editingTx
            ? t("edit_trade")
            : initialType === "BUY"
              ? t("buy_record")
              : t("sell_record")
        }
      >
        <TradeForm
          key={editingTx?.txId ?? "new"}
          portfolioId={portfolio.portfolioId}
          initialType={editingTx?.ptType ?? initialType}
          editingTx={editingTx ?? undefined}
          onSuccess={handleTradeSuccess}
          onCancel={handleCloseModal}
        />
      </FormSheet>
    </div>
  );
}
