// 추이 차트용 Y축 도메인 — 데이터 범위로 줌인해 작은 변동도 슬로프로 보이게 한다.
// recharts 기본 도메인 [0, auto] 은 큰 절대값(수천만원)에 작은 증감(수%)이 눌려 평평해짐.
// 단 패딩 하한 3% — 없으면 -0.7% 도 차트 높이 40% 급락처럼 보인다(배치2 S6 F-205).
// minPadRatio — 홈 Sparkline(그리는 높이 ~22px)은 0: 3% 하한이면 0.5% 변동이 3px 이라 일자로 보인다.
// 바로 옆 DeltaPill 이 정확한 % 를 보여줘 모양을 키워도 오해가 적다.
export function trendYDomain(values: number[], minPadRatio = 0.03): [number, number] {
  if (values.length === 0) return [0, 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min;
  // 전부 같은 값이면 여백이 0 이 돼 도메인이 한 점으로 접힌다 → 그때만 3% 로 가운데 둔다
  const pad = spread > 0 ? Math.max(spread * 0.6, max * minPadRatio) : max * 0.03;
  return [Math.max(0, min - pad), max + pad];
}
