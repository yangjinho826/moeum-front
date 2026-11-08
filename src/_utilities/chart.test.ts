import { describe, expect, it } from "vitest";

import { momPct, trendYDomain } from "./chart";

describe("trendYDomain", () => {
  it("H2 기본(TrendLine)은 여백 하한 3% 를 그대로 둔다", () => {
    // 변동 50만 → 여백 max(30만, 1억50만*3%) = 301.5만
    expect(trendYDomain([100_000_000, 100_500_000])).toEqual([96_985_000, 103_515_000]);
  });

  it("H3 하한 0(Sparkline)이면 변동 폭의 60% 만 여백으로 둔다", () => {
    expect(trendYDomain([100_000_000, 100_500_000], 0)).toEqual([99_700_000, 100_800_000]);
  });

  it("H4 값이 전부 같으면 하한 0 이어도 3% 로 가운데 둔다(도메인이 한 점으로 접히지 않게)", () => {
    expect(trendYDomain([1_000, 1_000], 0)).toEqual([970, 1_030]);
  });
});

describe("momPct — 전월 대비 %", () => {
  it("S1 바로 앞 점이 전달이면 % 를 준다", () => {
    expect(momPct({ date: "2026-09-01", value: 100 }, { date: "2026-10-01", value: 110 })).toBeCloseTo(10);
  });

  it("S4 앞 점이 전달이 아니면(기록 빠진 달) null", () => {
    expect(momPct({ date: "2026-07-01", value: 100 }, { date: "2026-09-01", value: 110 })).toBeNull();
  });

  it("S4b 해를 넘겨도 12월 → 1월은 전달로 본다", () => {
    expect(momPct({ date: "2025-12-01", value: 200 }, { date: "2026-01-08", value: 100 })).toBeCloseTo(-50);
  });

  it("S7 앞 점이 없거나 값이 0 이면 null", () => {
    expect(momPct(undefined, { date: "2026-10-01", value: 110 })).toBeNull();
    expect(momPct({ date: "2026-09-01", value: 0 }, { date: "2026-10-01", value: 110 })).toBeNull();
  });
});
