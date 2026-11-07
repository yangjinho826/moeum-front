import { describe, expect, it } from "vitest";

import type { TransactionBaseRequestType } from "./types";
import {
  applyTypeChange,
  pickInitialAccountId,
  resetForNext,
  selectableAccounts,
  transferIssue,
} from "./form-rules";

const base: TransactionBaseRequestType = {
  txType: "EXPENSE",
  amount: 12000,
  txDate: "2026-11-07",
  accountId: "acc-a",
  toAccountId: null,
  categoryId: null,
  paidByUserId: null,
  fixedExpenseId: null,
  memo: "점심",
  valuationDirection: null,
};

const categories = [
  { categoryId: "food", kind: "EXPENSE" as const },
  { categoryId: "salary", kind: "INCOME" as const },
];

describe("applyTypeChange — 유형에 없는 칸은 비운다(숨은 값이 그대로 전송되지 않게)", () => {
  it("W8-1 이체에서 지출로 바꾸면 받는 통장이 비워진다", () => {
    const next = applyTypeChange({ ...base, txType: "TRANSFER", toAccountId: "acc-b" }, "EXPENSE", categories);
    expect(next.toAccountId).toBeNull();
    expect(next.amount).toBe(12000); // 금액·메모는 그대로
    expect(next.memo).toBe("점심");
  });

  it("W8-2 지출 카테고리는 이체·수입으로 바꾸면 비워지고, 맞는 kind 면 남는다", () => {
    const expense = { ...base, categoryId: "food" };
    expect(applyTypeChange(expense, "TRANSFER", categories).categoryId).toBeNull();
    expect(applyTypeChange(expense, "INCOME", categories).categoryId).toBeNull();
    expect(applyTypeChange(expense, "FIXED_EXPENSE", categories).categoryId).toBe("food");
    const income = { ...base, txType: "INCOME" as const, categoryId: "salary" };
    expect(applyTypeChange(income, "INCOME", categories).categoryId).toBe("salary");
  });

  it("W8-4 고정지출에서 지출로 바꾸면 고정지출 항목이 비워진다", () => {
    const next = applyTypeChange({ ...base, txType: "FIXED_EXPENSE", fixedExpenseId: "rent" }, "EXPENSE", categories);
    expect(next.fixedExpenseId).toBeNull();
    expect(next.txType).toBe("EXPENSE");
  });
});

describe("transferIssue — 이체는 받는 통장이 있고 출발과 달라야 한다", () => {
  it("W8-3 받는 통장 없음 / 같은 통장 / 정상", () => {
    expect(transferIssue({ ...base, txType: "TRANSFER", toAccountId: null })).toBe("to_account_required");
    expect(transferIssue({ ...base, txType: "TRANSFER", toAccountId: "acc-a" })).toBe("same_account");
    expect(transferIssue({ ...base, txType: "TRANSFER", toAccountId: "acc-b" })).toBeNull();
    expect(transferIssue({ ...base, txType: "EXPENSE", toAccountId: null })).toBeNull();
  });
});

describe("pickInitialAccountId — 마지막에 쓴 통장을 기본값으로", () => {
  const accounts = [
    { accountId: "acc-a", isArchived: false, isManualAsset: false },
    { accountId: "acc-old", isArchived: true, isManualAsset: false },
  ];

  it("W8-5 마지막 통장이 활성이면 그 통장, 보관·삭제·기록 없음이면 빈 값", () => {
    expect(pickInitialAccountId(accounts, "acc-a")).toBe("acc-a");
    expect(pickInitialAccountId(accounts, "acc-old")).toBe("");
    expect(pickInitialAccountId(accounts, "acc-gone")).toBe("");
    expect(pickInitialAccountId(accounts, undefined)).toBe("");
  });
});

describe("resetForNext — 저장 후 계속: 같은 통장·유형·날짜로 다음 건", () => {
  it("W8-6 금액·메모·카테고리·받는 통장·고정지출만 비운다", () => {
    const saved = {
      ...base,
      txType: "FIXED_EXPENSE" as const,
      categoryId: "food",
      fixedExpenseId: "rent",
      toAccountId: null,
      valuation: 500,
    };

    const next = resetForNext(saved);

    expect(next).toMatchObject({
      txType: "FIXED_EXPENSE",
      accountId: "acc-a",
      txDate: "2026-11-07",
      amount: 0,
      memo: null,
      categoryId: null,
      fixedExpenseId: null,
      toAccountId: null,
      valuation: 0,
    });
  });
});

describe("리뷰 반영", () => {
  it("W8-9 평가조정이 아닌 유형으로 바꾸면 평가 방향이 비워진다", () => {
    const valuation = { ...base, txType: "VALUATION" as const, valuationDirection: "INCREASE" as const };
    expect(applyTypeChange(valuation, "EXPENSE", categories).valuationDirection).toBeNull();
    expect(applyTypeChange(valuation, "VALUATION", categories).valuationDirection).toBe("INCREASE");
  });

  it("W8-2b 목록에 없는(보관) 카테고리는 같은 kind 끼리 전환하면 남는다", () => {
    const archived = { ...base, categoryId: "archived-food" };
    expect(applyTypeChange(archived, "FIXED_EXPENSE", categories).categoryId).toBe("archived-food");
    expect(applyTypeChange(archived, "INCOME", categories).categoryId).toBeNull();
  });

  it("W8-5b 수동자산 통장은 마지막 통장이어도 기본값으로 쓰지 않는다", () => {
    const accounts = [{ accountId: "apt", isArchived: false, isManualAsset: true }];
    expect(pickInitialAccountId(accounts, "apt")).toBe("");
  });
});

describe("selectableAccounts — 거래 폼 통장 선택지에서 보관 통장을 뺀다", () => {
  const accounts = [
    { accountId: "acc-a", isArchived: false },
    { accountId: "acc-old", isArchived: true },
    { accountId: "acc-b", isArchived: false },
  ];

  it("P4-1 새 거래면 보관 통장은 선택지에 없다", () => {
    expect(selectableAccounts(accounts, "").map((a) => a.accountId)).toEqual(["acc-a", "acc-b"]);
  });

  it("P4-2 수정 중인 거래가 보관 통장이면 그 통장은 남긴다(값이 빈칸으로 안 보이게)", () => {
    expect(selectableAccounts(accounts, "acc-old").map((a) => a.accountId)).toEqual([
      "acc-a",
      "acc-old",
      "acc-b",
    ]);
  });
});
