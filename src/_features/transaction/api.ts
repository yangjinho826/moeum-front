import { apiFetch } from "_libraries/fetch/api-fetch";
import { objectToParams } from "_libraries/fetch/object-to-params";
import type {
  ApiCursorPage,
  ApiResponse,
} from "_libraries/fetch/response";

import type { AccountListItemType } from "_features/account/types";
import type { CategoryListItemType } from "_features/category/types";
import type { FixedListItemType } from "_features/fixed/types";

import type {
  AccountLedgerItemType,
  TransactionCalendarFullType,
  TransactionCreateRequest,
  TransactionDetailItemType,
  TransactionFormOptionsType,
  TransactionListItemType,
  TransactionUpdateRequest,
} from "./types";

type BackendTransactionResponse = Omit<
  TransactionDetailItemType,
  "transactionId"
> & { id: string };

function toListItem(b: BackendTransactionResponse): TransactionListItemType {
  const { id, ...rest } = b;
  return { ...rest, transactionId: id };
}

function toDetail(b: BackendTransactionResponse): TransactionDetailItemType {
  const { id, ...rest } = b;
  return { ...rest, transactionId: id };
}

type BackendLedgerItem = BackendTransactionResponse & {
  signedAmount: number;
  balanceAfter: number;
};

interface BackendLedgerPage {
  items: BackendLedgerItem[];
  nextCursor: string | null;
  hasNext: boolean;
  totalCount: number | null;
}

function toLedgerItem(b: BackendLedgerItem): AccountLedgerItemType {
  const { id, ...rest } = b;
  return { ...rest, transactionId: id };
}

export async function GetAccountLedgerApi(
  accountId: string,
  params: {
    cursor?: string | null;
    limit?: number;
    year?: number;
    month?: number;
  },
) {
  const queryParams: Record<string, unknown> = {};
  if (params.cursor) queryParams.cursor = params.cursor;
  if (params.limit) queryParams.limit = params.limit;
  if (params.year !== undefined) queryParams.year = params.year;
  if (params.month !== undefined) queryParams.month = params.month;

  const queryString = objectToParams(queryParams).toString();
  const res = await apiFetch<ApiResponse<BackendLedgerPage>>(
    `/api/transaction/account/${accountId}/ledger${queryString ? `?${queryString}` : ""}`,
    { method: "GET" },
  );
  const items = (res.body.data?.items ?? []).map((b) => toLedgerItem(b));
  const wrapped: ApiCursorPage<AccountLedgerItemType> = {
    code: res.body.code,
    message: res.body.message,
    status: res.body.status,
    data: {
      items,
      nextCursor: res.body.data?.nextCursor ?? null,
      hasNext: res.body.data?.hasNext ?? false,
      totalCount: res.body.data?.totalCount ?? null,
    },
  };
  return { ...res, body: wrapped };
}

export async function GetTransactionDetailApi(transactionId: string) {
  const res = await apiFetch<ApiResponse<BackendTransactionResponse>>(
    `/api/transaction/detail/${transactionId}`,
    { method: "GET" },
  );
  return { ...res, body: { ...res.body, data: toDetail(res.body.data) } };
}

export async function PostTransactionCreateApi(
  params: TransactionCreateRequest,
  idempotencyKey?: string,
) {
  const res = await apiFetch<ApiResponse<BackendTransactionResponse>>(
    `/api/transaction/create`,
    {
      method: "POST",
      body: params,
      idempotencyKey,
      errorHandleMethod: "reject",
    },
  );
  return { ...res, body: { ...res.body, data: toDetail(res.body.data) } };
}

export async function PutTransactionUpdateApi(
  params: TransactionUpdateRequest,
) {
  const { transactionId, ...rest } = params;
  return apiFetch<ApiResponse<void>>(
    `/api/transaction/update/${transactionId}`,
    { method: "PUT", body: rest, errorHandleMethod: "reject" },
  );
}

export function DeleteTransactionDeleteApi(transactionId: string) {
  return apiFetch<ApiResponse<void>>(
    `/api/transaction/delete/${transactionId}`,
    { method: "DELETE", errorHandleMethod: "reject" },
  );
}

type BackendAccount = Omit<AccountListItemType, "accountId"> & {
  id: string;
};
type BackendCategory = Omit<CategoryListItemType, "categoryId"> & {
  id: string;
};
type BackendFixed = Omit<FixedListItemType, "fixedId"> & {
  id: string;
};

interface BackendCalendarFull
  extends Omit<TransactionCalendarFullType, "transactions"> {
  transactions: BackendTransactionResponse[];
}

interface BackendFormOptions {
  accounts: BackendAccount[];
  categories: BackendCategory[];
  fixedExpenses: BackendFixed[];
}

/** 달력 페이지 1호출 — calendar + stats + 그달 거래. accountId 있으면 그 통장만 */
export async function GetTransactionCalendarFullApi(params: {
  year: number;
  month: number;
  accountId?: string;
}) {
  const queryString = objectToParams({ accountId: params.accountId }).toString();
  const res = await apiFetch<ApiResponse<BackendCalendarFull>>(
    `/api/transaction/calendar/${params.year}/${params.month}/full${queryString ? `?${queryString}` : ""}`,
    { method: "GET" },
  );
  const transactions = res.body.data.transactions.map((b) => toListItem(b));
  const mapped: TransactionCalendarFullType = {
    year: res.body.data.year,
    month: res.body.data.month,
    monthlyIncome: res.body.data.monthlyIncome,
    monthlyExpense: res.body.data.monthlyExpense,
    monthlyTransfer: res.body.data.monthlyTransfer,
    days: res.body.data.days,
    byCategory: res.body.data.byCategory,
    transactions,
  };
  return { ...res, body: { ...res.body, data: mapped } };
}

/** 거래 등록/수정 폼 옵션 — 통장 + 카테고리 + 활성 고정지출 */
export async function GetTransactionFormOptionsApi() {
  const res = await apiFetch<ApiResponse<BackendFormOptions>>(
    `/api/transaction/form-options`,
    { method: "GET" },
  );
  const accounts: AccountListItemType[] = res.body.data.accounts.map(
    ({ id, ...rest }) => ({ ...rest, accountId: id }),
  );
  const categories: CategoryListItemType[] = res.body.data.categories.map(
    ({ id, ...rest }) => ({ ...rest, categoryId: id }),
  );
  const fixedExpenses: FixedListItemType[] = res.body.data.fixedExpenses.map(
    ({ id, ...rest }) => ({ ...rest, fixedId: id }),
  );
  const mapped: TransactionFormOptionsType = {
    accounts,
    categories,
    fixedExpenses,
  };
  return { ...res, body: { ...res.body, data: mapped } };
}
