export type TxType =
  | "EXPENSE"
  | "INCOME"
  | "TRANSFER"
  | "FIXED_EXPENSE"
  | "VALUATION";

/** 평가조정(VALUATION) 거래의 증감 방향 — 그 외 타입에는 없음 */
export type ValuationDirection = "INCREASE" | "DECREASE";

/** 거래 목록 타입 칩 — "all" 은 유형 무관 */
export type TransactionFilterMode = "all" | TxType;

export interface TransactionSearchRequestType {
  searchTerm?: string;
  txType?: TxType;
  accountId?: string;
  categoryId?: string;
  fromDate?: string;
  toDate?: string;
  year?: number;
  month?: number;
}

export interface TransactionBaseRequestType {
  txType: TxType;
  amount: number;
  txDate: string;
  accountId: string;
  toAccountId?: string | null;
  categoryId?: string | null;
  paidByUserId?: string | null;
  fixedExpenseId: string | null;
  memo?: string | null;
  // VALUATION 거래에서만 — 평가액 증감 방향
  valuationDirection?: ValuationDirection | null;
}

export type TransactionCreateRequest = TransactionBaseRequestType;

export interface TransactionUpdateRequest extends TransactionBaseRequestType {
  transactionId: string;
}

export interface TransactionListItemType {
  transactionId: string;
  householdId: string;
  txType: TxType;
  amount: number;
  txDate: string;
  accountId: string;
  toAccountId: string | null;
  categoryId: string | null;
  paidByUserId: string | null;
  fixedExpenseId: string | null;
  memo: string | null;
  valuationDirection?: ValuationDirection | null;
  // 조인된 표시 필드 (백엔드 응답에 포함)
  accountName?: string | null;
  toAccountName?: string | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  categoryIcon?: string | null;
  // 보관/삭제된 고정지출에 물린 과거 거래도 이름이 내려온다
  fixedExpenseName?: string | null;
}

/** 계좌별 거래 이력 행 — 거래 + 그 계좌 관점 부호 금액 + 거래 후 잔액(running balance) */
export interface AccountLedgerItemType extends TransactionListItemType {
  signedAmount: number; // 이 계좌 기준 +(입금/수입)/−(출금/지출)
  balanceAfter: number; // 그 거래 직후 이 계좌 잔액
}

/** 달력 일별 합계 1건 — calendarFull 응답 안의 days[] */
export interface TransactionCalendarDay {
  date: string; // YYYY-MM-DD
  income: number;
  expense: number;
  transfer: number;
  count: number;
}

/** GET /transaction/calendar/{year}/{month}/full 응답 — 캘린더 페이지 1호출 묶음 */
export interface TransactionCalendarFullType {
  year: number;
  month: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyTransfer: number;
  days: TransactionCalendarDay[];
  byCategory: import("_features/stats/types").CategoryStatsItemType[];
  transactions: TransactionListItemType[];
}

/** GET /transaction/form-options 응답 — 거래 폼 옵션 묶음 */
export interface TransactionFormOptionsType {
  accounts: import("_features/account/types").AccountListItemType[];
  categories: import("_features/category/types").CategoryListItemType[];
  fixedExpenses: import("_features/fixed/types").FixedListItemType[];
}

export interface TransactionDetailItemType {
  transactionId: string;
  householdId: string;
  txType: TxType;
  amount: number;
  txDate: string;
  accountId: string;
  toAccountId: string | null;
  categoryId: string | null;
  paidByUserId: string | null;
  fixedExpenseId: string | null;
  memo: string | null;
  valuationDirection?: ValuationDirection | null;
  accountName?: string | null;
  toAccountName?: string | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  categoryIcon?: string | null;
  fixedExpenseName?: string | null;
}
