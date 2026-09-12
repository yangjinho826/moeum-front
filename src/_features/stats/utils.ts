/** 월 통계 byCategory → 지출 상위 N (금액 내림차순). 홈·거래 요약·레일 공용 */
export function topExpenseCategories<T extends { isIncome: boolean; amount: number }>(
  byCategory: readonly T[],
  n: number,
): T[] {
  return byCategory
    .filter((c) => !c.isIncome)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, n);
}
