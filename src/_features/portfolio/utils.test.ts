import { describe, expect, it } from "vitest";

import { hasActiveInvestment } from "./utils";

const group = (isArchived: boolean) => ({ account: { isArchived } });

describe("hasActiveInvestment — 홈 투자손익 칸은 집계되는 투자통장이 있을 때만", () => {
  it("W8-8 투자통장이 전부 보관이면 false, 하나라도 활성이면 true", () => {
    expect(hasActiveInvestment([group(true), group(true)])).toBe(false);
    expect(hasActiveInvestment([group(true), group(false)])).toBe(true);
    expect(hasActiveInvestment([])).toBe(false);
  });
});
