import { useMemo } from "react";

import { useFixedInfiniteList } from "_features/fixed/queries/use-query";
import type { FixedListItemType } from "_features/fixed/types";

const PAGE_SIZE = 30;

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
