import { describe, expect, it } from "vitest";

import type { TransactionListItemType, TxType } from "./types";
import { filterTxns } from "./utils";

function tx(id: string, txType: TxType): TransactionListItemType {
  return {
    transactionId: id,
    householdId: "hh",
    txType,
    amount: 1000,
    txDate: "2026-11-07",
    accountId: "acc-a",
    toAccountId: null,
    categoryId: null,
    paidByUserId: null,
    fixedExpenseId: null,
    memo: null,
  };
}

const items = [tx("e", "EXPENSE"), tx("f", "FIXED_EXPENSE"), tx("i", "INCOME")];
const ids = (list: TransactionListItemType[]) => list.map((it) => it.transactionId);

describe("filterTxns — 지출 칩은 고정지출까지 포함한다", () => {
  it("P5-1 지출 칩이면 일반 지출과 고정지출이 같이 보인다", () => {
    expect(ids(filterTxns(items, { filter: "EXPENSE" }))).toEqual(["e", "f"]);
  });

  it("P5-2 고정지출 칩은 고정지출만, 수입 칩은 수입만", () => {
    expect(ids(filterTxns(items, { filter: "FIXED_EXPENSE" }))).toEqual(["f"]);
    expect(ids(filterTxns(items, { filter: "INCOME" }))).toEqual(["i"]);
  });
});
