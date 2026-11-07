import type { AccountSnapshotMonthItem } from "./types";

/** 박제 월 지출 — 거래 탭(get_calendar)과 같은 정의: 일반 지출 + 고정지출 */
export const snapshotMonthExpense = (
  m: Pick<AccountSnapshotMonthItem, "totalExpense" | "totalFixedExpense">,
): number => m.totalExpense + m.totalFixedExpense;
