import { createQueryKeys } from "@lukemorales/query-key-factory";

import {
  GetTransactionCalendarFullApi,
  GetTransactionDetailApi,
  GetTransactionFormOptionsApi,
} from "../api";

export const transactions = createQueryKeys("transaction", {
  // 계좌별 거래 이력(running balance) 무한 스크롤 — queryKey 만 등록
  // (queryFn 은 useAccountLedgerInfinite 헬퍼에서 cursor 주입해서 호출.
  //  transaction._def invalidate 에 자동으로 잡힌다)
  accountLedger: (
    accountId: string,
    pageSize: number,
    year?: number,
    month?: number,
  ) => ({
    queryKey: [accountId, pageSize, year, month],
  }),
  detail: (transactionId: string) => ({
    queryKey: [transactionId],
    queryFn: () => GetTransactionDetailApi(transactionId),
  }),
  calendarFull: (params: {
    year: number;
    month: number;
    accountId?: string;
  }) => ({
    queryKey: [params],
    queryFn: () => GetTransactionCalendarFullApi(params),
  }),
  formOptions: () => ({
    queryKey: ["form-options"],
    queryFn: () => GetTransactionFormOptionsApi(),
  }),
});
