import type { CSSVariablesResolver } from "@mantine/core";

import { type SchemeSurface, SURFACE } from "./palette";

/**
 * `--moeum-*` CSS 변수 — 컴포넌트가 스킴을 모른 채 쓰는 표면·의미색 값 (DESIGN.md §2).
 * Mantine 이 <html data-mantine-color-scheme> 에 따라 light/dark 블록을 골라 준다.
 *
 * 표면: bg · surface · surface-2 · hair · hair-2 · text · text-dim
 * 행동: accent · accent-soft · on-accent
 * 의미: income · expense (가계부) / up · down (자산 방향, 한국식)
 * 차트: chart-1..5 = accent · expense · text · muted · hair
 */
function schemeVariables(s: SchemeSurface): Record<string, string> {
  return {
    "--moeum-bg": s.bg,
    "--moeum-surface": s.surface,
    "--moeum-surface-2": s.surface2,
    "--moeum-hair": s.hair,
    "--moeum-hair-2": s.hair2,
    "--moeum-text": s.text,
    "--moeum-text-dim": s.textDim,
    "--moeum-accent": s.accent,
    "--moeum-accent-soft": s.accentSoft,
    "--moeum-on-accent": s.onAccent,
    "--moeum-income": s.income,
    "--moeum-expense": s.expense,
    "--moeum-up": s.up,
    "--moeum-down": s.down,
    "--moeum-chart-1": s.accent,
    "--moeum-chart-2": s.expense,
    "--moeum-chart-3": s.text,
    "--moeum-chart-4": s.chartMuted,
    "--moeum-chart-5": s.hair,
    // Mantine 기본 변수도 같은 값으로 — body 는 light 에서 white 라 덮어씀
    "--mantine-color-body": s.bg,
    "--mantine-color-text": s.text,
    "--mantine-color-dimmed": s.textDim,
    "--mantine-color-default-border": s.hair,
    "--mantine-color-placeholder": s.placeholder,
  };
}

export const moeumCssVariables: CSSVariablesResolver = () => ({
  variables: {},
  light: schemeVariables(SURFACE.light),
  dark: schemeVariables(SURFACE.dark),
});
