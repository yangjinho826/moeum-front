"use client";

import { Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { useAccountSnapshotYearly } from "_features/account-snapshot/queries/use-query";
import Section from "_features/common/components/section";
import TrendLine, { type TrendPoint } from "_features/common/components/trend-line";
import { semanticColor, signColor } from "_styles/semantic-color";
import { fmtSignedPct } from "_utilities/fmt";

interface Props {
  accountId: string;
  title?: string;
}

// 계좌 상세 — 그 통장의 월별 잔액(balance) 추이 (Section + TrendLine, Figma 41:365 ChartWrap).
// 데이터는 account_snapshots(전 계좌 박제) 에서 이 계좌만 추출 → hero 잔액과 일치.
// 투자계좌는 balance = 현금+평가, 일반 통장은 통장 잔액.
export default function AccountBalanceTrend({ accountId, title }: Props) {
  const t = useTranslations("portfolio");
  const { data } = useAccountSnapshotYearly();
  const months = data.body.data.months;

  // 이 계좌가 박제된 달만 추출 (나중에 만든 계좌는 과거 달에 없음)
  const points = useMemo<TrendPoint[]>(
    () =>
      months
        .map((m) => {
          const acc = m.accounts.find((a) => a.accountId === accountId);
          return acc ? { date: m.snapshotDate, value: acc.balance } : null;
        })
        .filter((x): x is TrendPoint => x !== null),
    [months, accountId],
  );

  // 데이터 0~1건이면 추이로서 의미 없음 — 숨김
  if (points.length < 2) return null;

  // 첫 박제월 대비 최근 자산 증감
  const first = points[0]?.value ?? 0;
  const last = points[points.length - 1]?.value ?? 0;
  const periodPct = first > 0 ? ((last - first) / first) * 100 : null;

  return (
    <Section
      title={title ?? t("balance_trend")}
      right={
        periodPct !== null ? (
          <Text
            className="moeum-mono moeum-label"
            fw={600}
            style={{
              color: semanticColor(signColor(periodPct, "asset")),
            }}
          >
            {t("recent_months", { count: points.length })} {fmtSignedPct(periodPct, 1)}
          </Text>
        ) : null
      }
    >
      <TrendLine points={points} tooltip />
    </Section>
  );
}
