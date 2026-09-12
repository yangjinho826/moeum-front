/**
 * 의미색 이름 → `--moeum-*` CSS 변수 (DESIGN.md §2-3·§2-4).
 * 화면 코드는 hex·셰이드 대신 이 이름만 쓴다 — 스킴은 css-variables.ts 가 처리.
 *
 *   accent = 행동·활성 / income = 수입 / expense = 지출 / transfer = 이체
 *   up = 투자 상승·매수·총자산▲ / down = 하락·매도·▼ (한국식)
 *   text = 본문 / dim = 보조 / chart1..5 = 차트 계열(추이·현금·부동산·연금·기타)
 */
export type SemanticColor =
  | "accent"
  | "income"
  | "expense"
  | "transfer"
  | "up"
  | "down"
  | "text"
  | "dim"
  | "chart1"
  | "chart2"
  | "chart3"
  | "chart4"
  | "chart5";

const VAR: Record<SemanticColor, string> = {
  accent: "var(--moeum-accent)",
  income: "var(--moeum-income)",
  expense: "var(--moeum-expense)",
  transfer: "var(--mantine-color-purple-5)",
  up: "var(--moeum-up)",
  down: "var(--moeum-down)",
  text: "var(--moeum-text)",
  dim: "var(--moeum-text-dim)",
  chart1: "var(--moeum-chart-1)",
  chart2: "var(--moeum-chart-2)",
  chart3: "var(--moeum-chart-3)",
  chart4: "var(--moeum-chart-4)",
  chart5: "var(--moeum-chart-5)",
};

export const semanticColor = (c: SemanticColor = "text"): string => VAR[c];

/** 부호 → 색. asset = up/down(자산 방향), ledger = income/expense(가계부). 0 은 dim */
export const signColor = (
  value: number,
  variant: "asset" | "ledger",
): SemanticColor => {
  if (value === 0) return "dim";
  if (variant === "asset") return value > 0 ? "up" : "down";
  return value > 0 ? "income" : "expense";
};

/** 순위(0부터) → 차트 계열색. 5개 넘으면 chart5 */
export const chartColor = (index: number): SemanticColor =>
  (["chart1", "chart2", "chart3", "chart4", "chart5"] as const)[
    Math.min(index, 4)
  ] ?? "chart5";

/** 방향이 정해진 금액(이번 달 수입·지출·고정지출)의 색. 0 은 방향이 없어 dim (배치3 H-306) */
export const amountColor = (value: number, color: SemanticColor): SemanticColor =>
  value === 0 ? "dim" : color;
