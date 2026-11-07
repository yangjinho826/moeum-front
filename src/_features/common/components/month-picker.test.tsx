// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import ko from "_messages/ko.json";
import { currentYearMonthKst } from "_utilities/datetime";

import MonthPicker from "./month-picker";

beforeAll(() => {
  // Mantine 이 색 구성표를 볼 때 쓰는데 jsdom 엔 없다
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

afterEach(cleanup);

function wrap(ui: ReactNode) {
  return render(
    <MantineProvider>
      <NextIntlClientProvider locale="ko" messages={ko}>
        {ui}
      </NextIntlClientProvider>
    </MantineProvider>,
  );
}

function shiftMonth(yearMonth: string, delta: number): string {
  const [y, m] = yearMonth.split("-").map(Number) as [number, number];
  const total = y * 12 + (m - 1) + delta;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

describe("MonthPicker 이번 달 버튼", () => {
  it("W8-7 지난달을 보고 있으면 '이번 달' 로 바로 돌아온다", () => {
    const thisMonth = currentYearMonthKst();
    const onChange = vi.fn();
    wrap(<MonthPicker value={shiftMonth(thisMonth, -3)} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "이번 달" }));

    expect(onChange).toHaveBeenCalledWith(thisMonth);
  });

  it("W8-7 이미 이번 달이면 버튼이 없다", () => {
    wrap(<MonthPicker value={currentYearMonthKst()} onChange={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "이번 달" })).toBeNull();
  });
});
