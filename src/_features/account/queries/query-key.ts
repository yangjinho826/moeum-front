import { createQueryKeys } from "@lukemorales/query-key-factory";

import { GetAccountDetailApi, GetAccountReportApi } from "../api";

export const accounts = createQueryKeys("account", {
  detail: (accountId: string) => ({
    queryKey: [accountId],
    queryFn: () => GetAccountDetailApi(accountId),
  }),
  report: (accountId: string) => ({
    queryKey: [accountId],
    queryFn: () => GetAccountReportApi(accountId),
  }),
});
