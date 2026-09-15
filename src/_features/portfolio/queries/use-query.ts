import {
  useInfiniteQuery,
  useQueryClient,
  useSuspenseQueries,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { queryKeys } from "_constants/queries";
import { firstDayOfYearKst, todayIsoKst } from "_utilities/datetime";

import { GetPortfolioItemTransactionsApi } from "../api";

export const usePortfolioOverview = () => {
  return useSuspenseQuery(queryKeys.portfolio.overview());
};

export const useAccountOverview = (accountId: string) => {
  return useSuspenseQuery(queryKeys.portfolio.byAccount(accountId));
};

export const usePortfolioFormOptions = () => {
  return useSuspenseQuery(queryKeys.portfolio.formOptions());
};

export const usePortfolioItem = (itemId: string) => {
  return useSuspenseQuery(queryKeys.portfolio.item(itemId));
};

/** 종목 매매손익 — 기간 내 매도 건별 실현손익 + 요약 */
export const useItemRealizedPnl = (
  itemId: string,
  fromDate?: string,
  toDate?: string,
) => {
  return useSuspenseQuery(
    queryKeys.portfolio.itemRealizedPnl({ itemId, fromDate, toDate }),
  );
};

/** 계좌 누적 매매손익 — 계좌 전체 매도 건별 실현손익 + 요약 (전량매도된 종목 포함) */
export const useAccountRealizedPnl = (
  accountId: string,
  fromDate?: string,
  toDate?: string,
) => {
  return useSuspenseQuery(
    queryKeys.portfolio.accountRealizedPnl({ accountId, fromDate, toDate }),
  );
};

/**
 * 계좌 올해 매매손익 — 레일용. 전체(매도 이력 있는지) + 올해(1/1~오늘, 표시값)를 병렬 조회.
 * 올해 키는 매매손익 시트 기본 기간과 같아 시트가 캐시로 바로 열린다.
 */
export const useAccountRealizedPnlThisYear = (accountId: string) => {
  const [all, thisYear] = useSuspenseQueries({
    queries: [
      queryKeys.portfolio.accountRealizedPnl({ accountId }),
      queryKeys.portfolio.accountRealizedPnl({
        accountId,
        fromDate: firstDayOfYearKst(),
        toDate: todayIsoKst(),
      }),
    ],
  });
  return { all: all.data.body.data, thisYear: thisYear.data.body.data };
};

/** 종목 평가액 월별 추이 — 기본 최근 12개월 */
export const usePortfolioValueHistoryByItem = (
  portfolioItemId: string,
  fromDate?: string,
  toDate?: string,
) => {
  return useSuspenseQuery(
    queryKeys.portfolio.valueHistoryByItem({ portfolioItemId, fromDate, toDate }),
  );
};

/** 종목 단건 거래 내역 — 무한 스크롤. transaction 패턴과 동일. */
export const usePortfolioItemTransactionsInfinite = (
  itemId: string,
  pageSize = 30,
) => {
  const keyDef = queryKeys.portfolio.itemTransactionsInfinite({
    itemId,
    pageSize,
  });
  return useInfiniteQuery({
    queryKey: keyDef.queryKey,
    queryFn: ({ pageParam }) =>
      GetPortfolioItemTransactionsApi(itemId, pageParam, pageSize),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      const { nextCursor, hasNext } = lastPage.body.data;
      return hasNext && nextCursor ? nextCursor : undefined;
    },
  });
};

/** 폼 등 비페이지 진입에서 종목 detail 이 필요한 경우 — 명령형 fetch */
export const usePortfolioItemFetch = () => {
  const queryClient = useQueryClient();
  return async (itemId: string) => {
    return await queryClient.fetchQuery({
      ...queryKeys.portfolio.item(itemId),
    });
  };
};
