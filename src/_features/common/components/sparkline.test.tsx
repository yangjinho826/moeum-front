// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

describe("Sparkline 월 눈금·툴팁", () => {
  const values = [100_000_000, 101_000_000, 101_505_000];

  it("S3 axisLabels 를 주면 점마다 월 숫자가 보인다", () => {
    const { container } = render(
      <MantineProvider>
        <Sparkline values={values} axisLabels={["9", "10", "11"]} />
      </MantineProvider>,
    );

    // 축 눈금만 — recharts 가 글자 폭을 재려고 숨김 복사본을 따로 그려서 getByText 는 중복된다
    const ticks = [...container.querySelectorAll(".recharts-cartesian-axis-tick-value")].map((el) => el.textContent);
    expect(ticks).toEqual(["9", "10", "11"]);
  });

  it("S5 툴팁을 켜도 점 탭은 그달 인덱스로 간다", () => {
    const onPointClick = vi.fn();
    render(
      <MantineProvider>
        <Sparkline
          values={values}
          axisLabels={["9", "10", "11"]}
          renderTooltip={(i) => `tip-${i}`}
          onPointClick={onPointClick}
          labels={["9월", "10월", "지금"]}
        />
      </MantineProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "10월" }));

    expect(onPointClick).toHaveBeenCalledWith(1);
  });
});
