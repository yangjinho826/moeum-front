/**
 * 포매터 / ID 생성 / 날짜 헬퍼 — 도메인 무관
 */

import { todayIsoKst } from "./datetime";

export const fmt = (n: number): string =>
  new Intl.NumberFormat("ko-KR").format(Math.round(n));

/** "YYYY-MM-DD" — KST 기준. 신규 코드는 todayIsoKst 직접 사용 권장 */
export const todayIso = (): string => todayIsoKst();

/** 부호 붙은 금액 — `+1,234` / `−1,234`(U+2212) / `0` */
export const fmtSigned = (n: number): string =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${fmt(Math.abs(n))}`;

/** 부호 붙은 % — `+6.1%` (기본 소수 1 — DeltaPill·추이와 같은 자릿수) */
export const fmtSignedPct = (n: number, digits = 1): string =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(digits)}%`;

/** 방향 화살표 % — `▲ 6.1%` (투자 상승/하락 표기, 기본 소수 1) */
export const fmtArrowPct = (n: number, digits = 1): string =>
  `${n > 0 ? "▲ " : n < 0 ? "▼ " : ""}${Math.abs(n).toFixed(digits)}%`;

export const newId = (): string => Math.random().toString(36).slice(2, 10);
