import { useMemo } from "react";

import { useFixedInfiniteList } from "_features/fixed/queries/use-query";
import type { FixedListItemType } from "_features/fixed/types";

// 관리 목록은 개수·분류 섹션·기록/미기록이 전체 기준이어야 해서 한 번에 넉넉히(백엔드 상한 200). 넘치면 센티널이 이어 받는다
const PAGE_SIZE = 100;

export function useFixedSearch() {
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useFixedInfiniteList({}, PAGE_SIZE);

  const items: FixedListItemType[] = useMemo(
    () => data.pages.flatMap((p) => p.body.data.items),
    [data],
  );
  const totalCount = data.pages[0]?.body.data.totalCount ?? items.length;

  return {
    items,
    totalCount,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
}
