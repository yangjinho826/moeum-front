"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import CompositionBar, { type CompositionSegment } from "_features/common/components/composition-bar";
import ListRow from "_features/common/components/list-row";
import Section from "_features/common/components/section";
import { chartColor, type SemanticColor } from "_styles/semantic-color";
import { fmt } from "_utilities/fmt";

/** 종목 비중: 상위 4개(chart1~4) + 외 N(dim · 2개 이상일 때만 묶음, 탭하면 펼침) + 현금(chart5) */
const TOP_STOCKS = 4;
const REST_COLOR: SemanticColor = "dim";
const CASH_COLOR: SemanticColor = "chart5";

export interface StockShareItem {
  portfolioId: string;
  name: string;
  currentValue: number;
}

interface StockSharesProps {
  /** 활성 종목(정렬·0 필터는 여기서) */
  stocks: StockShareItem[];
  cash: number;
}

/**
 * StockShares — 종목 비중 = 구성 막대 한 줄(CompositionBar) + 색 점 행 (도넛 대체 B, Figma 25:179 38:376).
 * 투자 메인(전체)·계좌 상세(그 계좌) 공용. 비중은 (종목 평가액 합 + 현금) 대비.
 */
export default function StockShares({ stocks: rawStocks, cash }: StockSharesProps) {
  const t = useTranslations("portfolio");
  const { locale } = useParams<{ locale: string }>();
  const [restOpen, setRestOpen] = useState(false);

  const stocks = rawStocks
    .filter((p) => p.currentValue > 0)
    .sort((a, b) => b.currentValue - a.currentValue);
  const hasCash = cash > 0;
  if (stocks.length === 0 && !hasCash) return null;

  const shareTotal = stocks.reduce((s, p) => s + p.currentValue, 0) + cash;
  const ratio = (v: number) => (shareTotal > 0 ? v / shareTotal : 0);
  const pctOf = (v: number) => (shareTotal > 0 ? `${Math.round(ratio(v) * 100)}%` : undefined);
  // "외 1개" 처럼 하나만 남으면 묶지 않고 그냥 보여준다
  const rest = stocks.length > TOP_STOCKS + 1 ? stocks.slice(TOP_STOCKS) : [];
  const top = rest.length > 0 ? stocks.slice(0, TOP_STOCKS) : stocks;
  const restSum = rest.reduce((s, p) => s + p.currentValue, 0);

  // 막대 조각 = 행의 색 점과 같은 색
  const segments: CompositionSegment[] = [
    ...top.map((p, i) => ({ key: p.portfolioId, ratio: ratio(p.currentValue), color: chartColor(i) })),
    ...(rest.length > 0 ? [{ key: "__rest", ratio: ratio(restSum), color: REST_COLOR }] : []),
    ...(hasCash ? [{ key: "__cash", ratio: ratio(cash), color: CASH_COLOR }] : []),
  ];

  return (
    <Section title={t("stock_allocation")}>
      <CompositionBar segments={segments} />
      {top.map((p, i) => (
        <ListRow
          key={p.portfolioId}
          titleDot={chartColor(i)}
          title={p.name}
          value={fmt(p.currentValue)}
          sub={pctOf(p.currentValue)}
          last={!hasCash && rest.length === 0 && i === top.length - 1}
          href={`/${locale}/invest/portfolio/${p.portfolioId}`}
        />
      ))}
      {rest.length > 0 && (
        <>
          <ListRow
            titleDot={REST_COLOR}
            title={t("etc_count", { count: rest.length })}
            value={fmt(restSum)}
            sub={pctOf(restSum)}
            chevron
            last={!hasCash && !restOpen}
            onClick={() => setRestOpen((v) => !v)}
          />
          {restOpen &&
            rest.map((p, i) => (
              <ListRow
                key={p.portfolioId}
                title={p.name}
                value={fmt(p.currentValue)}
                sub={pctOf(p.currentValue)}
                last={!hasCash && i === rest.length - 1}
                href={`/${locale}/invest/portfolio/${p.portfolioId}`}
              />
            ))}
        </>
      )}
      {hasCash && (
        <ListRow titleDot={CASH_COLOR} title={t("cash_slice")} value={fmt(cash)} sub={pctOf(cash)} last />
      )}
    </Section>
  );
}
