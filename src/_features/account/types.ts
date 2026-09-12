// 백엔드 enum: LIVING / SAVINGS / INVESTMENT / REAL_ESTATE / PENSION / COMMODITY / SAVINGS_ASSET / OTHER
// REAL_ESTATE / PENSION / COMMODITY / SAVINGS_ASSET 는 수동자산(부동산·연금·금·적금) 전용 계좌 타입
// — 거래(수입/지출) 대신 평가조정(VALUATION) 거래로 잔액이 변동된다.
export type AccountType =
  | "LIVING"
  | "SAVINGS"
  | "INVESTMENT"
  | "REAL_ESTATE"
  | "PENSION"
  | "COMMODITY"
  | "SAVINGS_ASSET"
  | "OTHER";

/** 수동자산(부동산·연금·금·적금) 전용 통장 타입 — 거래 대신 평가조정으로 잔액 변동 */
export type ManualAssetAccountType =
  | "REAL_ESTATE"
  | "PENSION"
  | "COMMODITY"
  | "SAVINGS_ASSET";

export interface AccountBaseRequestType {
  name: string;
  accountType: AccountType;
  startBalance: number;
  color?: string | null;
  icon?: string | null;
  sortOrder: number;
  isArchived: boolean;
}

export type AccountCreateRequest = AccountBaseRequestType;

export interface AccountUpdateRequest extends AccountBaseRequestType {
  accountId: string;
}

export interface AccountListItemType {
  accountId: string;
  householdId: string;
  name: string;
  accountType: AccountType;
  startBalance: number;
  balance: number;
  color: string | null;
  icon: string | null;
  sortOrder: number;
  isArchived: boolean;
  // 수동자산 통장(부동산·연금·금)이면 true — 거래폼에서 이체 전용 분기
  isManualAsset: boolean;
  // INVESTMENT 통장 한정 — 그 외 타입은 null
  cash: number | null;
  portfolioCost: number | null;
  portfolioValuation: number | null;
  portfolioProfitLoss: number | null;
  portfolioProfitLossRate: number | null;
}

export interface AccountDetailItemType {
  accountId: string;
  householdId: string;
  name: string;
  accountType: AccountType;
  startBalance: number;
  balance: number;
  color: string | null;
  icon: string | null;
  sortOrder: number;
  isArchived: boolean;
  // 수동자산 통장(부동산·연금·금)이면 true
  isManualAsset: boolean;
  // INVESTMENT 통장 한정
  cash: number | null;
  portfolioCost: number | null;
  portfolioValuation: number | null;
  portfolioProfitLoss: number | null;
  portfolioProfitLossRate: number | null;
}

export interface AccountMonthlyFlowType {
  monthDate: string; // YYYY-MM-DD (그달 1일)
  income: number;
  expense: number;
  fixedExpense: number;
  balance: number; // 그달 잔액 (이번달은 현재 잔액)
}

export interface AccountReportType {
  accountId: string;
  accountName: string;
  accountType: AccountType;
  balance: number;
  monthlyFlows: AccountMonthlyFlowType[];
}
