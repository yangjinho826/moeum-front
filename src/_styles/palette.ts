import type { MantineColorsTuple } from "@mantine/core";

/**
 * Statement · Warm 팔레트 — 라이트/다크 두 벌의 단일 hex 소스 (DESIGN.md §2).
 *
 * 이 파일 밖에서 hex 를 쓰지 않는다. 컴포넌트는 `c="positive.5"` 같은 테마 색이나
 * `var(--moeum-*)` (css-variables.ts 가 발급) 만 참조한다.
 */

/** 스킴 하나의 표면·텍스트·의미색 값 */
export interface SchemeSurface {
  bg: string;
  surface: string;
  surface2: string;
  hair: string;
  hair2: string;
  text: string;
  textDim: string;
  placeholder: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  income: string;
  expense: string;
  up: string;
  down: string;
  chartMuted: string;
}

// sage — 행동색 (탭 활성·버튼·링크·추이선·브랜드)
export const sage: MantineColorsTuple = [
  "#F4F7F2", "#E6EDE2", "#CDDBC6", "#AFC4A4", "#93AC85",
  "#7C9473", "#647A5C", "#4F6149", "#3D4B39", "#2C3629",
];

// terracotta — 지출 · 잔액 음수
export const terracotta: MantineColorsTuple = [
  "#FCF4EF", "#F7E3D9", "#EFCBB8", "#E7B097", "#E5B197",
  "#D98E73", "#C2674A", "#A4543B", "#83432F", "#5F3122",
];

// positive — 수입 · 잔액 양수 · 저축
export const positive: MantineColorsTuple = [
  "#E7F3EC", "#C6E3D2", "#9FCFB2", "#73B88E", "#4E9F70",
  "#2F855A", "#266E4A", "#1F5A3D", "#184430", "#102E20",
];

// danger — 에러·삭제. `up`(투자 상승·매수·총자산 증가, 한국식 빨강) 이 같은 튜플을 별칭으로 쓴다
export const danger: MantineColorsTuple = [
  "#FEF2F2", "#FEE2E2", "#FECACA", "#FCA5A5", "#F87171",
  "#EF4444", "#DC2626", "#B91C1C", "#991B1B", "#7F1D1D",
];

// warning — 주의·임박·고정지출 태그
export const warning: MantineColorsTuple = [
  "#FFFBEB", "#FEF3C7", "#FDE68A", "#FCD34D", "#FBBF24",
  "#F59E0B", "#D97706", "#B45309", "#92400E", "#78350F",
];

// info — 안내. `down`(투자 하락·매도·총자산 감소, 파랑) 이 같은 튜플을 별칭으로 쓴다
export const info: MantineColorsTuple = [
  "#EFF6FF", "#DBEAFE", "#BFDBFE", "#93C5FD", "#60A5FA",
  "#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF", "#1E3A8A",
];

// purple — 이체·평가조정
export const purple: MantineColorsTuple = [
  "#F5F3FF", "#EDE9FE", "#DDD6FE", "#C4B5FD", "#A78BFA",
  "#8B5CF6", "#7C3AED", "#6D28D9", "#5B21B6", "#4C1D95",
];

/** 웜 그레이 — 라이트 중립. 0=shell · 1=hair-2/surface-2 · 2=hair · 6=dimmed · 9=text */
export const grayScale: MantineColorsTuple = [
  "#F7F4EF", "#EDE8E0", "#DDD5C9", "#C3B9A9", "#A99C8D",
  "#9C8F82", "#7A6F63", "#5A5149", "#423B34", "#3C3530",
];

/**
 * 다크 튜플 — 딥브라운. Mantine 내부 CSS 가 직접 참조하는 다크 표면.
 * 0=text · 2=dimmed · 3=placeholder · 4=hair · 5=surface-2(Input filled) ·
 * 6=surface(Popover·Modal) · 7=body · 8·9=더 깊은 배경.
 */
export const darkScale: MantineColorsTuple = [
  "#F1EAE0", "#D9D0C3", "#A8998A", "#7A6F63", "#3A322B",
  "#332C26", "#2A241F", "#1F1A16", "#171310", "#110E0B",
];

/** 스킴별 값. Mantine 튜플(gray/dark)과 --moeum-* 변수가 같은 값을 본다. */
export const SURFACE: Record<"light" | "dark", SchemeSurface> = {
  light: {
    bg: "#FAF6EF",
    surface: "#FFFDF9",
    surface2: "#F3EEE4",
    hair: grayScale[2],
    hair2: grayScale[1],
    text: grayScale[9],
    textDim: grayScale[6],
    placeholder: grayScale[5],
    accent: sage[6],
    accentSoft: "rgba(124, 148, 115, 0.14)",
    onAccent: "#FFFFFF",
    income: positive[5],
    expense: terracotta[6],
    up: danger[6],
    down: info[6],
    chartMuted: grayScale[4],
  },
  dark: {
    bg: darkScale[7],
    surface: darkScale[6],
    surface2: darkScale[5],
    hair: darkScale[4],
    hair2: "#2F2823",
    text: darkScale[0],
    textDim: darkScale[2],
    placeholder: darkScale[3],
    accent: sage[4],
    accentSoft: "rgba(147, 172, 133, 0.16)",
    onAccent: darkScale[7],
    income: positive[3],
    expense: terracotta[4],
    up: danger[4],
    down: info[4],
    chartMuted: darkScale[3],
  },
};
