import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { queryKeys } from "_constants/queries";


export const useAccountReport = (accountId: string) => {
  return useSuspenseQuery(queryKeys.account.report(accountId));
};

export const useAccountDetail = () => {
  const queryClient = useQueryClient();

  return async (accountId: string) => {
    return await queryClient.fetchQuery({
      ...queryKeys.account.detail(accountId),
    });
  };
};
