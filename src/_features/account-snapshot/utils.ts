import { momPct } from "_utilities/chart";

import type { AccountSnapshotMonthItem } from "./types";

/** 박제 월 지출 — 거래 탭(get_calendar)과 같은 정의: 일반 지출 + 고정지출 */
export const snapshotMonthExpense = (
  m: Pick<AccountSnapshotMonthItem, "totalExpense" | "totalFixedExpense">,
): number => m.totalExpense + m.totalFixedExpense;

export interface TrendTip {
  title: string;
  /** 총자산을 가린 상태면 null */
  amount: number | null;
  mom: number | null;
}

/**
 * 홈 추이선 점 하나의 툴팁 — 박제 월은 "10월", 마지막(지금 계산한) 점은 "11.08 기준".
 * 가린 상태면 금액은 비운다 — 가려둔 금액이 호버로 새지 않게.
 */
export function trendTip(
  points: readonly { date: string; value: number }[],
  index: number,
  opts: { hidden: boolean; currentTitle: string; monthTitle: (iso: string) => string },
): TrendTip | null {
  const point = points[index];
  if (!point) return null;
  const isCurrent = index === points.length - 1;
  return {
    title: isCurrent ? opts.currentTitle : opts.monthTitle(point.date),
    amount: opts.hidden ? null : point.value,
    mom: momPct(points[index - 1], point),
  };
}
