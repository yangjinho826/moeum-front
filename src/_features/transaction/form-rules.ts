import type { CategoryKind } from "_features/category/types";

import type { TransactionBaseRequestType, TxType } from "./types";

/** 유형이 받는 카테고리 kind — 이체·평가조정은 카테고리가 없다(백엔드 _category_kind_matches 와 같은 규칙) */
const CATEGORY_KIND_BY_TYPE: Record<TxType, CategoryKind | null> = {
  EXPENSE: "EXPENSE",
  FIXED_EXPENSE: "EXPENSE",
  INCOME: "INCOME",
  TRANSFER: null,
  VALUATION: null,
};

/** 유형이 받는 카테고리 kind — 폼의 카테고리 선택지와 전환 규칙이 같은 표를 본다 */
export function categoryKindOf(txType: TxType): CategoryKind | null {
  return CATEGORY_KIND_BY_TYPE[txType];
}

interface CategoryKindRef {
  categoryId: string;
  kind: CategoryKind;
}

/**
 * 유형 전환 — 새 유형에 없는 칸을 비운다. 화면에서 숨겨진 값이 그대로 전송되면
 * 백엔드가 거부하거나(이체+카테고리) 집계가 어긋난다. 금액·날짜·메모는 그대로 둔다.
 */
export function applyTypeChange<T extends TransactionBaseRequestType>(
  values: T,
  nextType: TxType,
  categories: readonly CategoryKindRef[],
): T {
  const kind = CATEGORY_KIND_BY_TYPE[nextType];
  // 목록에 없는 카테고리(보관 등)는 지금 유형의 kind 로 본다 — 같은 kind 끼리 전환이면 남긴다
  const categoryKind =
    categories.find((c) => c.categoryId === values.categoryId)?.kind ??
    CATEGORY_KIND_BY_TYPE[values.txType];
  return {
    ...values,
    txType: nextType,
    toAccountId: nextType === "TRANSFER" ? (values.toAccountId ?? null) : null,
    fixedExpenseId: nextType === "FIXED_EXPENSE" ? values.fixedExpenseId : null,
    valuationDirection: nextType === "VALUATION" ? (values.valuationDirection ?? null) : null,
    categoryId: kind && categoryKind === kind ? (values.categoryId ?? null) : null,
  };
}

/** 값은 i18n 키(transaction.*) */
export type TransferIssue = "to_account_required" | "same_account";

/** 이체 검증 — 받는 통장 필수, 출발 통장과 같으면 안 된다(백엔드도 400) */
export function transferIssue(
  values: Pick<TransactionBaseRequestType, "txType" | "accountId" | "toAccountId">,
): TransferIssue | null {
  if (values.txType !== "TRANSFER") return null;
  if (!values.toAccountId) return "to_account_required";
  if (values.toAccountId === values.accountId) return "same_account";
  return null;
}

/** 마지막에 쓴 통장 — 지금 목록에 있고 보관되지 않았을 때만 기본값으로 */
export function pickInitialAccountId(
  accounts: readonly { accountId: string; isArchived: boolean; isManualAsset: boolean }[],
  lastAccountId: string | undefined,
): string {
  const last = accounts.find((a) => a.accountId === lastAccountId);
  // 수동자산(부동산 등)은 평가조정 전용 — 기본값이면 다음 + 가 평가조정 모드로 열린다
  return last && !last.isArchived && !last.isManualAsset ? last.accountId : "";
}

/**
 * 거래 폼 통장 선택지 — 보관 통장은 뺀다. 단, 지금 고른 통장(수정 중인 거래가 보관 통장)은 남긴다.
 * 빼 버리면 Select 가 값을 못 찾아 빈칸으로 보인다.
 */
export function selectableAccounts<T extends { accountId: string; isArchived: boolean }>(
  accounts: readonly T[],
  currentId: string | null | undefined,
): T[] {
  return accounts.filter((a) => !a.isArchived || a.accountId === currentId);
}

/** 저장 후 계속 — 같은 통장·유형·날짜로 다음 건을 바로 입력하게, 건마다 다른 칸만 비운다 */
export function resetForNext<T extends TransactionBaseRequestType & { valuation: number }>(
  values: T,
): T {
  return {
    ...values,
    amount: 0,
    valuation: 0,
    memo: null,
    categoryId: null,
    toAccountId: null,
    fixedExpenseId: null,
  };
}
