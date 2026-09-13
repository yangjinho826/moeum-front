import { useMemo } from "react";

import { useCategoryInfiniteList } from "_features/category/queries/use-query";
import type { CategoryListItemType } from "_features/category/types";

// 관리 목록은 개수·분류 섹션·기록/미기록이 전체 기준이어야 해서 한 번에 넉넉히(백엔드 상한 200). 넘치면 센티널이 이어 받는다
const PAGE_SIZE = 100;

/** 카테고리 전체(지출·수입) — 목록은 분류별 섹션으로 나눠 보여서 필터 없이 받는다 (배치4). 백엔드 정렬 = 분류 → 정렬 → 등록순 */
export function useCategorySearch() {
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useCategoryInfiniteList({}, PAGE_SIZE);

  const items: CategoryListItemType[] = useMemo(() => data.pages.flatMap((p) => p.body.data.items), [data]);
  const expense = useMemo(() => items.filter((it) => it.kind === "EXPENSE"), [items]);
  const income = useMemo(() => items.filter((it) => it.kind === "INCOME"), [items]);

  return { items, expense, income, hasNextPage, fetchNextPage, isFetchingNextPage };
}
