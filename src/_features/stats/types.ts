export interface CategoryStatsItemType {
  categoryId: string;
  name: string;
  icon: string | null;
  color: string | null;
  isIncome: boolean;
  amount: number;
  ratio: number; // 0.00 ~ 1.00 — 같은 kind 내 max 대비
}

export interface MonthlyStatsType {
  year: number;
  month: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyTransfer: number;
  byCategory: CategoryStatsItemType[];
}
