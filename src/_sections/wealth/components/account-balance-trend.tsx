"use client";

import { Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import Section from "_features/common/components/section";
import { useAccountSnapshotYearly } from "_features/account-snapshot/queries/use-query";
import { useMonthLabel } from "_features/common/hooks/use-month-label";
import { semanticColor, signColor } from "_styles/semantic-color";
import { fmtSignedPct } from "_utilities/fmt";

import ValueTrendChart, { type TrendPoint } from "./value-trend-chart";

interface Props {
  accountId: string;
  title?: string;
}

// 계좌 상세 — 그 통장의 월별 잔액(balance) 추이 (Section, 카드 없음 — QA D-1).
// 데이터는 account_snapshots(전 계좌 박제) 에서 이 계좌만 추출 → hero 잔액과 일치.
// 투자계좌는 balance = 현금+평가, 일반 통장은 통장 잔액.
export default function AccountBalanceTrend({ accountId, title }: Props) {
  const t = useTranslations("portfolio");
  const monthLabel = useMonthLabel();
  const { data } = useAccountSnapshotYearly();
  const months = data.body.data.months;

  // 이 계좌가 박제된 달만 추출 (나중에 만든 계좌는 과거 달에 없음)
  const balances = useMemo(
    () =>
      months
        .map((m) => {
          const acc = m.accounts.find((a) => a.accountId === accountId);
          return acc ? { snapshotDate: m.snapshotDate, balance: acc.balance } : null;
        })
        .filter((x): x is { snapshotDate: string; balance: number } => x !== null),
    [months, accountId],
  );

  const trend = useMemo<TrendPoint[]>(
    () =>
      balances.map((b, i) => {
        const prev = i > 0 ? (balances[i - 1]?.balance ?? null) : null;
        const momPct = prev && prev > 0 ? ((b.balance - prev) / prev) * 100 : null;
        return { month: monthLabel(b.snapshotDate), value: b.balance, momPct };
      }),
    [balances, monthLabel],
  );

  // 첫 박제월 대비 최근 자산 증감
  const periodPct = useMemo(() => {
    const first = balances[0]?.balance;
    const last = balances[balances.length - 1]?.balance;
    if (!first || first <= 0 || last === undefined || balances.length < 2) return null;
    return ((last - first) / first) * 100;
  }, [balances]);

  // 데이터 0~1건이면 추이로서 의미 없음 — 숨김
  if (trend.length < 2) return null;

  return (
    <Section
      title={title ?? t("balance_trend")}
      right={
        periodPct !== null ? (
          <Text
            className="moeum-mono"
            fw={600}
            style={{
              fontSize: 11,
              lineHeight: "16px",
              letterSpacing: "0.06em",
              color: semanticColor(signColor(periodPct, "asset")),
            }}
          >
            {t("recent_months", { count: trend.length })} {fmtSignedPct(periodPct, 1)}
          </Text>
        ) : null
      }
    >
      <ValueTrendChart data={trend} />
    </Section>
  );
}
