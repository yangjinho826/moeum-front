import { useQueryClient, useSuspenseInfiniteQuery } from "@tanstack/react-query";

import { queryKeys } from "_constants/queries";

import { GetFixedSearchApi } from "../api";
import type { FixedSearchRequestType } from "../types";

export const useFixedInfiniteList = (
  params: FixedSearchRequestType,
  pageSize = 30,
) => {
  const keyDef = queryKeys.fixed.infinite({ ...params, pageSize });
  // Suspense — 첫 페이지 전엔 라우트 스켈레톤. 비-Suspense 면 로딩 중 빈 목록("없어요")이 잠깐 보인다 (배치4)
  return useSuspenseInfiniteQuery({
    queryKey: keyDef.queryKey,
    queryFn: ({ pageParam }) =>
      GetFixedSearchApi({ ...params, cursor: pageParam, limit: pageSize }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      const { nextCursor, hasNext } = lastPage.body.data;
      return hasNext && nextCursor ? nextCursor : undefined;
    },
  });
};

export const useFixedDetail = () => {
  const queryClient = useQueryClient();
  return async (fixedId: string) => {
    return await queryClient.fetchQuery({
      ...queryKeys.fixed.detail(fixedId),
    });
  };
};
