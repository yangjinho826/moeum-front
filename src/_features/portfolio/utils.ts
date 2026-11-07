import { PORTFOLIO_PALETTE } from "_styles/design-tokens";

import type {
  PortfolioDetailItemType,
  PortfolioListItemType,
} from "./types";

/**
 * 종목명에 팔레트 색 하나를 안정적으로 매핑.
 * 같은 종목명은 항상 같은 색 (hash mod).
 */
export function pickPortfolioColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % PORTFOLIO_PALETTE.length;
  return PORTFOLIO_PALETTE[idx]!;
}

export interface PortfolioStat {
  totalValue: number;
  totalCost: number;
  profit: number;
  profitRate: number;
}

type AnyPortfolio = PortfolioListItemType | PortfolioDetailItemType;

/**
 * 포트폴리오 (계좌/종목 단위) 평가 합산.
 * - totalValue: 평가금액 합 (currentValue)
 * - totalCost: 매입금 합 (quantity * avgPrice)
 * - profit: 평가손익 = totalValue - totalCost
 * - profitRate: 손익률 (%) = profit / totalCost * 100
 */
export function portfolioCalc(items: AnyPortfolio[]): PortfolioStat {
  const totalValue = items.reduce((s, p) => s + p.currentValue, 0);
  const totalCost = items.reduce((s, p) => s + p.quantity * p.avgPrice, 0);
  const profit = totalValue - totalCost;
  const profitRate = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  return { totalValue, totalCost, profit, profitRate };
}

/** 한국 주식 표기 — 양수 빨강(상승), 음수 파랑(하락), 0 회색 */
export function profitColor(profit: number): string {
  if (profit > 0) return "danger.5";
  if (profit < 0) return "info.5";
  return "gray.6";
}

/** "+1.49%" / "-5.10%" 포맷 */
export function formatProfitRate(rate: number): string {
  const sign = rate > 0 ? "+" : "";
  return `${sign}${rate.toFixed(2)}%`;
}

/** "+36,994" / "-63,244" — fmt 연동은 호출자에서 */
export function formatProfitAmount(amount: number, formatter: (n: number) => string): string {
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  return `${sign}${formatter(Math.abs(amount))}`;
}

/** 집계되는(보관 아닌) 투자통장이 있나 — 백엔드 투자 요약은 보관 통장을 빼므로(W3) 칸 노출도 같은 기준 */
export function hasActiveInvestment(
  groups: readonly { account: { isArchived: boolean } }[],
): boolean {
  return groups.some((g) => !g.account.isArchived);
}
