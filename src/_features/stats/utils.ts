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

/** 저축률(%) — 수입이 0 이면 정의 불가라 null (화면은 "—") */
export function savingRate(income: number, expense: number): number | null {
  return income > 0 ? ((income - expense) / income) * 100 : null;
}
