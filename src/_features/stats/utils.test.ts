import { describe, expect, it } from "vitest";

import { savingRate } from "./utils";

describe("savingRate", () => {
  it("수입 대비 남은 비율(%)", () => {
    expect(savingRate(3_635_670, 2_099_533)).toBeCloseTo(42.25, 2);
  });

  it("W1-2 수입이 0 이면 정의 불가 — null", () => {
    expect(savingRate(0, 50_000)).toBeNull();
  });

  it("지출이 수입보다 크면 음수", () => {
    expect(savingRate(100, 150)).toBe(-50);
  });
});
