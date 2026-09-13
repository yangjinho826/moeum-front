"use client";

import { useTranslations } from "next-intl";

import ListRow from "_features/common/components/list-row";
import { fmt } from "_utilities/fmt";

import { useQuickAddStore } from "../store";
import type { AccountLedgerItemType } from "../types";

interface LedgerRowProps {
  t: AccountLedgerItemType;
  /** 지금 보고 있는 계좌 — 이체 방향 판정 기준 */
  accountId: string;
  /** running balance 표시 여부 — INVESTMENT 는 숨김 */
  showBalance?: boolean;
  last?: boolean;
}

/**
 * 계좌 거래 이력 한 행 — ListRow 번역 (Figma transactions 22:90 ListRow + Sub 잔액).
 * 그 계좌 관점의 부호 금액(입금 income · 출금 expense · 이체 purple) + 그 거래 직후 잔액.
 * 이체는 이 계좌가 입금처면 +(상대=출금처), 출금이면 −(상대=입금처).
 */
export default function LedgerRow({
  t,
  accountId,
  showBalance = true,
  last = false,
}: LedgerRowProps) {
  const tt = useTranslations("transaction");
  const tTxType = useTranslations("enum.tx-type");
  const openEdit = useQuickAddStore((s) => s.open);

  // 이체 방향은 signedAmount 부호가 아니라 계좌 매칭으로 — 0원 이체도 정확하게.
  const isTransfer = t.txType === "TRANSFER";
  const isPositive = isTransfer ? t.toAccountId === accountId : t.signedAmount >= 0;
  const counterparty = isPositive ? t.accountName : t.toAccountName;

  const isFixed = t.txType === "FIXED_EXPENSE";
  const title =
    t.memo || (isFixed ? t.fixedExpenseName : null) || t.categoryName || tt("tx_default_label");

  // 메타 — 이체는 상대계좌, 평가조정은 타입명, 고정지출은 항목명(제목과 다를 때), 그 외 카테고리
  const meta = isTransfer
    ? `${isPositive ? "← " : "→ "}${counterparty ?? "—"}`
    : t.txType === "VALUATION"
      ? tTxType("VALUATION")
      : isFixed && t.fixedExpenseName && t.fixedExpenseName !== title
        ? t.fixedExpenseName
        : (t.categoryName ?? "—");

  return (
    <ListRow
      title={title}
      tag={isFixed ? tTxType("FIXED_EXPENSE") : undefined}
      meta={meta}
      dot={t.categoryColor}
      value={`${isPositive ? "+" : "−"}${fmt(Math.abs(t.signedAmount))}`}
      valueColor={isTransfer ? "transfer" : isPositive ? "income" : "expense"}
      sub={showBalance ? `${tt("balance_current")} ${fmt(t.balanceAfter)}` : undefined}
      last={last}
      onClick={() => openEdit(t.transactionId, t.txType)}
    />
  );
}
