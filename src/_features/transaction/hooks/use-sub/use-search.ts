import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

import { defaultYearMonth } from "_features/common/components/month-picker";
import type { TransactionFilterMode } from "_features/transaction/types";

export type TransactionViewMode = "list" | "calendar";

const VIEW_MODES: TransactionViewMode[] = ["list", "calendar"];
const FILTER_MODES: TransactionFilterMode[] = [
  "all",
  "EXPENSE",
  "INCOME",
  "TRANSFER",
  "FIXED_EXPENSE",
];

/**
 * 거래 목록 화면 URL 상태 — view/filter/month 를 nuqs 로 동기화.
 * 다른 도메인의 use-search 와 동일 패턴.
 */
export function useTransactionSearch() {
  const [params, setParams] = useQueryStates({
    view: parseAsStringEnum<TransactionViewMode>(VIEW_MODES).withDefault("list"),
    filter: parseAsStringEnum<TransactionFilterMode>(FILTER_MODES).withDefault(
      "all",
    ),
    month: parseAsString.withDefault(defaultYearMonth()),
    // 계좌 필터 — 빈 문자열 = 전체 계좌
    account: parseAsString.withDefault(""),
    // 카테고리 드릴다운 — 빈 문자열 = 선택 안 함. 지출 Top5 에서 고른다
    category: parseAsString.withDefault(""),
  });

  const [yearStr, monthStr] = params.month.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  return {
    view: params.view,
    filter: params.filter,
    month: params.month,
    accountId: params.account || undefined,
    categoryId: params.category || undefined,
    year,
    monthNum: month,
    setView: (next: TransactionViewMode) => setParams({ view: next }),
    setFilter: (next: TransactionFilterMode) => setParams({ filter: next }),
    // 월·통장이 바뀌면 그 모수에 없을 수도 있는 카테고리 선택은 의미가 없다.
    // 특히 지출 0 인 통장으로 바꾸면 Top5 섹션 자체가 사라져(해제 링크 포함)
    // 좁혀진 목록에서 빠져나올 길이 없어진다.
    setMonth: (next: string) => setParams({ month: next, category: "" }),
    setAccountId: (next: string | undefined) =>
      setParams({ account: next ?? "", category: "" }),
    setCategoryId: (next: string | undefined) =>
      setParams({ category: next ?? "" }),
  };
}
