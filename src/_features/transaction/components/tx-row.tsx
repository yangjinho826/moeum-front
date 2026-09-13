"use client";

import { useTranslations } from "next-intl";

import ListRow from "_features/common/components/list-row";
import type { SemanticColor } from "_styles/semantic-color";
import { fmt } from "_utilities/fmt";

import { useQuickAddStore } from "../store";
import type { TransactionListItemType } from "../types";

/** "YYYY-MM-DD" → "9.11" */
const shortDate = (iso: string): string =>
  `${Number(iso.slice(5, 7))}.${Number(iso.slice(8, 10))}`;

interface TxRowProps {
  item: TransactionListItemType;
  /** 메타에 날짜 포함(홈 최근 기록처럼 날짜 헤더가 없는 목록) */
  withDate?: boolean;
  last?: boolean;
}

/**
 * 거래 한 행 — ListRow 번역 (DESIGN.md §5, Figma ListRow 11:2).
 * 제목 = 메모 > 고정지출명 > 카테고리. 메타 = 카테고리 점 + 카테고리 · (날짜) · 통장.
 * 금액 색: 지출 expense · 수입 income · 이체 purple · 평가조정은 방향 up/down.
 */
export default function TxRow({ item, withDate = false, last = false }: TxRowProps) {
  const t = useTranslations("transaction");
  const tTxType = useTranslations("enum.tx-type");
  const openEdit = useQuickAddStore((s) => s.open);

  const isFixed = item.txType === "FIXED_EXPENSE";
  const title =
    item.memo || (isFixed ? item.fixedExpenseName : null) || item.categoryName || t("tx_default_label");
  // 제목이 이미 고정지출명이면 메타엔 카테고리 — 같은 이름 두 줄 반복 방지
  const kind =
    item.txType === "TRANSFER" || item.txType === "VALUATION"
      ? tTxType(item.txType)
      : (item.categoryName ?? tTxType(item.txType));
  const account =
    item.txType === "TRANSFER"
      ? `${item.accountName ?? "—"} → ${item.toAccountName ?? "—"}`
      : (item.accountName ?? "—");
  const meta = [kind, withDate ? shortDate(item.txDate) : null, account]
    .filter(Boolean)
    .join(" · ");

  const { sign, color } = txSign(item);

  return (
    <ListRow
      title={title}
      tag={isFixed ? tTxType("FIXED_EXPENSE") : undefined}
      meta={meta}
      dot={item.categoryColor}
      value={`${sign}${fmt(item.amount)}`}
      valueColor={color}
      last={last}
      onClick={() => openEdit(item.transactionId, item.txType)}
    />
  );
}

/** 거래 유형 → 부호·색 (DESIGN.md §2-3) */
export function txSign(item: TransactionListItemType): { sign: string; color: SemanticColor } {
  switch (item.txType) {
    case "INCOME":
      return { sign: "+", color: "income" };
    case "TRANSFER":
      return { sign: "", color: "transfer" };
    case "VALUATION":
      return item.valuationDirection === "DECREASE"
        ? { sign: "−", color: "down" }
        : { sign: "+", color: "up" };
    default:
      return { sign: "−", color: "expense" };
  }
}
