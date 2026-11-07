import { describe, expect, it } from "vitest";

import { fmtMan, fmtPct } from "./fmt";

describe("fmtMan", () => {
  it("1만 이상은 만 단위 반올림 정수", () => {
    expect(fmtMan(20_709)).toBe("2");
    expect(fmtMan(3_060_000)).toBe("306");
  });

  it("W1-3 1만 미만은 소수 1자리 — 0만으로 사라지지 않음", () => {
    expect(fmtMan(3_000)).toBe("0.3");
    expect(fmtMan(9_960)).toBe("1");
  });

  it("아주 작은 금액도 0.1만 아래로 내려가지 않음", () => {
    expect(fmtMan(209)).toBe("0.1");
  });
});

describe("fmtMan 경계", () => {
  it("0 은 0 — 없는 0.1만을 만들지 않음", () => {
    expect(fmtMan(0)).toBe("0");
  });

  it("크기만 다룬다 — 부호는 호출부가 붙임", () => {
    expect(fmtMan(-5_000)).toBe("0.5");
  });
});

describe("fmtPct", () => {
  it("소수 1자리 %", () => {
    expect(fmtPct(42.254)).toBe("42.3%");
  });

  it("null 은 대시", () => {
    expect(fmtPct(null)).toBe("—");
  });
});
