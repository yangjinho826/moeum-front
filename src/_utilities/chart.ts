// 추이 차트용 Y축 도메인 — 데이터 범위로 줌인해 작은 변동도 슬로프로 보이게 한다.
// recharts 기본 도메인 [0, auto] 은 큰 절대값(수천만원)에 작은 증감(수%)이 눌려 평평해짐.
// 단 패딩 하한 3% — 없으면 -0.7% 도 차트 높이 40% 급락처럼 보인다(배치2 S6 F-205).
export function trendYDomain(values: number[]): [number, number] {
  if (values.length === 0) return [0, 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max((max - min) * 0.6, max * 0.03);
  return [Math.max(0, min - pad), max + pad];
}
