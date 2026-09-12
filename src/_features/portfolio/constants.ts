import type { SemanticColor } from "_styles/semantic-color";

import type { AssetClass } from "./types";

/**
 * 자산군 → 차트 계열색 고정 매핑 (DESIGN.md §2-4).
 * 비중 순위가 바뀌어도 색 의미가 유지돼야 과거 배분 추이와 현재 구성 막대가 같은 말을 한다.
 * 금·적금·기타는 chart-5 하나로 묶는다(작은 비중 — 이름은 행·툴팁 라벨로 구분).
 */
export const ASSET_CLASS_COLOR: Record<AssetClass, SemanticColor> = {
  INVESTMENT: "chart1",
  CASH: "chart2",
  REAL_ESTATE: "chart3",
  PENSION: "chart4",
  COMMODITY: "chart5",
  SAVINGS: "chart5",
  OTHER: "chart5",
};
