import { describe, expect, it } from "vitest";

import { snapshotMonthExpense, trendTip } from "./utils";

describe("snapshotMonthExpense", () => {
  it("W1-1 일반 지출과 고정지출을 합쳐 거래 탭 지출과 같은 값을 낸다", () => {
    const month = { totalExpense: 1_517_753, totalFixedExpense: 581_780 };

    expect(snapshotMonthExpense(month)).toBe(2_099_533);
  });

  it("고정지출이 0 이면 일반 지출 그대로", () => {
    expect(snapshotMonthExpense({ totalExpense: 10_000, totalFixedExpense: 0 })).toBe(10_000);
  });
});

describe("trendTip — 홈 추이선 툴팁 한 칸", () => {
  const points = [
    { date: "2026-09-01", value: 100_000_000 },
    { date: "2026-10-01", value: 101_000_000 },
    { date: "2026-11-08", value: 101_505_000 }, // 마지막 = 지금 계산한 총자산
  ];
  const opts = { currentTitle: "11.08 기준", monthTitle: (iso: string) => `${Number(iso.slice(5, 7))}월` };

  it("S1 박제 월이면 월 제목·금액·전월 %", () => {
    const tip = trendTip(points, 1, { ...opts, hidden: false });
    expect(tip?.title).toBe("10월");
    expect(tip?.amount).toBe(101_000_000);
    expect(tip?.mom).toBeCloseTo(1);
  });

  it("S2 총자산을 가린 상태면 금액은 비우고 전월 % 는 남긴다", () => {
    const tip = trendTip(points, 1, { ...opts, hidden: true });
    expect(tip?.amount).toBeNull();
    expect(tip?.mom).toBeCloseTo(1);
  });

  it("S6 마지막 점은 '기준일' 제목", () => {
    const tip = trendTip(points, 2, { ...opts, hidden: false });
    expect(tip?.title).toBe("11.08 기준");
    expect(tip?.mom).toBeCloseTo(0.5);
  });
});
