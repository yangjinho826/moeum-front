"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import Section from "_features/common/components/section";
import TrendLine, { type TrendPoint } from "_features/common/components/trend-line";
import { usePortfolioValueHistoryByItem } from "_features/portfolio/queries/use-query";
import { todayIsoKst } from "_utilities/datetime";

interface Props {
  portfolioId: string;
  /** 현재 평가액 — 마지막 점(오늘)으로 붙인다(투자 메인과 같은 방식) */
  currentValue: number;
}

// 종목 상세 — 그 종목의 월별 평가액 추이 + 기간 칩 (Section + TrendLine, Figma 45:130 ChartWrap).
export default function PortfolioValueTrend({ portfolioId, currentValue }: Props) {
  const t = useTranslations("portfolio");
  const { data } = usePortfolioValueHistoryByItem(portfolioId);
  const history = data.body.data.history;

  const points = useMemo<TrendPoint[]>(
    () => [
      ...history.map((h) => ({ date: h.snapshotDate, value: h.valuation })),
      { date: todayIsoKst(), value: currentValue },
    ],
    [history, currentValue],
  );

  // 박제 0건이면 오늘 점 하나뿐 — 추이로서 의미 없음, 숨김
  if (history.length < 1) return null;

  return (
    <Section title={t("trend_label")}>
      <TrendLine points={points} periods tooltip />
    </Section>
  );
}
