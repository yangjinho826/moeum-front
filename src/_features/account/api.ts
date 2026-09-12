import { apiFetch } from "_libraries/fetch/api-fetch";
import type { ApiResponse } from "_libraries/fetch/response";

import type {
  AccountCreateRequest,
  AccountDetailItemType,
  AccountReportType,
  AccountUpdateRequest,
} from "./types";

// 백엔드 응답은 PK 가 `id`. 프론트 타입은 `accountId` 로 통일.
type BackendAccountResponse = Omit<AccountDetailItemType, "accountId"> & {
  id: string;
};

export async function GetAccountDetailApi(accountId: string) {
  const res = await apiFetch<ApiResponse<BackendAccountResponse>>(
    `/api/account/detail/${accountId}`,
    { method: "GET" },
  );
  const { id, ...rest } = res.body.data;
  const mapped: AccountDetailItemType = { ...rest, accountId: id };
  return { ...res, body: { ...res.body, data: mapped } };
}

// 백엔드가 accountId 그대로(camelCase) 내려줌 — 별도 매핑 불필요
export async function GetAccountReportApi(accountId: string) {
  return apiFetch<ApiResponse<AccountReportType>>(
    `/api/account/report/${accountId}`,
    { method: "GET" },
  );
}

export async function PostAccountCreateApi(
  params: AccountCreateRequest,
  idempotencyKey?: string,
) {
  const res = await apiFetch<ApiResponse<BackendAccountResponse>>(
    `/api/account/create`,
    {
      method: "POST",
      body: params,
      idempotencyKey,
      errorHandleMethod: "reject",
    },
  );
  const { id, ...rest } = res.body.data;
  const mapped: AccountDetailItemType = { ...rest, accountId: id };
  return { ...res, body: { ...res.body, data: mapped } };
}

export async function PutAccountUpdateApi(params: AccountUpdateRequest) {
  const { accountId, ...rest } = params;
  return apiFetch<ApiResponse<void>>(
    `/api/account/update/${accountId}`,
    { method: "PUT", body: rest, errorHandleMethod: "reject" },
  );
}

export function DeleteAccountDeleteApi(accountId: string) {
  return apiFetch<ApiResponse<void>>(
    `/api/account/delete/${accountId}`,
    { method: "DELETE", errorHandleMethod: "reject" },
  );
}
