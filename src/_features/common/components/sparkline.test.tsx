// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import Sparkline from "./sparkline";

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

/** 점 탭 모드의 보이는 점(두 번째 circle)의 세로 위치 */
function dotY(label: string): number {
  const circles = screen.getByRole("button", { name: label }).querySelectorAll("circle");
  return Number(circles[1]?.getAttribute("cy"));
}

describe("Sparkline 세로 범위", () => {
  it("H1 총자산 1억에서 0.5% 변해도 선이 눈에 띄게 움직인다", () => {
    render(
      <MantineProvider>
        <Sparkline
          values={[100_000_000, 100_500_000]}
          onPointClick={vi.fn()}
          labels={["10월", "11월"]}
        />
      </MantineProvider>,
    );

    // 0 부터 그리면 두 점 차이가 1px 도 안 된다 — 몇 px 은 벌어져야 눈에 보인다
    expect(Math.abs(dotY("10월") - dotY("11월"))).toBeGreaterThan(5);
  });
});
