import { useQueryClient, useSuspenseInfiniteQuery } from "@tanstack/react-query";

import { queryKeys } from "_constants/queries";

import { GetCategorySearchApi } from "../api";
import type { CategorySearchRequestType } from "../types";

export const useCategoryInfiniteList = (
  params: CategorySearchRequestType,
  pageSize = 30,
) => {
  const keyDef = queryKeys.category.infinite({ ...params, pageSize });
  // Suspense — 첫 페이지 전엔 라우트 스켈레톤. 비-Suspense 면 로딩 중 빈 목록("없어요")이 잠깐 보인다 (배치4)
  return useSuspenseInfiniteQuery({
    queryKey: keyDef.queryKey,
    queryFn: ({ pageParam }) =>
      GetCategorySearchApi({ ...params, cursor: pageParam, limit: pageSize }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      const { nextCursor, hasNext } = lastPage.body.data;
      return hasNext && nextCursor ? nextCursor : undefined;
    },
  });
};

export const useCategoryDetail = () => {
  const queryClient = useQueryClient();
  return async (categoryId: string) => {
    return await queryClient.fetchQuery({
      ...queryKeys.category.detail(categoryId),
    });
  };
};
