import { TOKEN } from "_styles/design-tokens";

import type { AccountType, ManualAssetAccountType } from "./types";

/** 수동자산 통장 타입 — 자산 폼 Select 옵션 순서. 백엔드 MANUAL_ASSET_ACCOUNT_TYPES 와 동일 집합 */
export const MANUAL_ASSET_ACCOUNT_TYPES: ManualAssetAccountType[] = [
  "REAL_ESTATE",
  "PENSION",
  "COMMODITY",
  "SAVINGS_ASSET",
];

/** AccountType → Mantine 색상 키 (tossXxx) */
export const ACCOUNT_TYPE_MANTINE_COLOR: Record<AccountType, string> = {
  LIVING: "info",
  SAVINGS: "positive",
  INVESTMENT: "purple",
  REAL_ESTATE: "grape",
  PENSION: "pink",
  COMMODITY: "yellow",
  SAVINGS_ASSET: "teal",
  OTHER: "gray",
};

/** AccountType → hex (직접 색이 필요한 곳) */
export const ACCOUNT_TYPE_HEX: Record<AccountType, string> = {
  LIVING: TOKEN.blue,
  SAVINGS: TOKEN.positive,
  INVESTMENT: TOKEN.purple,
  REAL_ESTATE: "#8B5CF6",
  PENSION: "#EC4899",
  COMMODITY: "#F59E0B",
  SAVINGS_ASSET: "#10B981",
  OTHER: "#8B95A1",
};

/** 정렬 순서 (생활 → 적립 → 투자 → 기타) */
export const ACCOUNT_TYPE_ORDER: AccountType[] = [
  "LIVING",
  "SAVINGS",
  "INVESTMENT",
  "OTHER",
];

const ACCOUNT_TYPE_SET = new Set<string>(ACCOUNT_TYPE_ORDER);

/** 백엔드 enum 응답(string[])에서 유효한 AccountType 만 좁히는 런타임 가드 */
export const isAccountType = (value: string): value is AccountType =>
  ACCOUNT_TYPE_SET.has(value);

/**
 * running balance(거래 이력) 를 지원하는 거래계좌 — 현금흐름 잔액이 곧 balance.
 * 투자(평가액 섞임)·부동산/연금/금(거래 없음)은 제외.
 */
export const LEDGER_ACCOUNT_TYPES = new Set<string>(["LIVING", "SAVINGS", "OTHER"]);
