import { useMemo } from "react";

import { useCategoryInfiniteList } from "_features/category/queries/use-query";
import type { CategoryListItemType } from "_features/category/types";

const PAGE_SIZE = 30;

/** 카테고리 전체(지출·수입) — 목록은 분류별 섹션으로 나눠 보여서 필터 없이 받는다 (배치4). 백엔드 정렬 = 분류 → 정렬 → 등록순 */
export function useCategorySearch() {
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useCategoryInfiniteList({}, PAGE_SIZE);

  const items: CategoryListItemType[] = useMemo(() => data.pages.flatMap((p) => p.body.data.items), [data]);
  const expense = useMemo(() => items.filter((it) => it.kind === "EXPENSE"), [items]);
  const income = useMemo(() => items.filter((it) => it.kind === "INCOME"), [items]);

  return { items, expense, income, hasNextPage, fetchNextPage, isFetchingNextPage };
}
