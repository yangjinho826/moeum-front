import { describe, expect, it } from "vitest";

import { snapshotMonthExpense } from "./utils";

describe("snapshotMonthExpense", () => {
  it("W1-1 일반 지출과 고정지출을 합쳐 거래 탭 지출과 같은 값을 낸다", () => {
    const month = { totalExpense: 1_517_753, totalFixedExpense: 581_780 };

    expect(snapshotMonthExpense(month)).toBe(2_099_533);
  });

  it("고정지출이 0 이면 일반 지출 그대로", () => {
    expect(snapshotMonthExpense({ totalExpense: 10_000, totalFixedExpense: 0 })).toBe(10_000);
  });
});
