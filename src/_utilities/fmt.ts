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

/** 비율 % — 소수 1자리, null(정의 불가 — 예: 수입 0 저축률)은 "—" */
export const fmtPct = (n: number | null): string => (n === null ? "—" : `${n.toFixed(1)}%`);

/**
 * 만 단위 숫자(크기만 — 부호는 호출부) — 1만 이상 정수 반올림, 미만은 소수 1자리(최소 0.1).
 * 달력 셀에서 소액 지출이 "-0만"으로 사라지지 않게.
 */
export const fmtMan = (n: number): string => {
  if (n === 0) return "0";
  const man = Math.abs(n) / 10000;
  if (man >= 1) return String(Math.round(man));
  const oneDecimal = Math.max(0.1, Math.round(man * 10) / 10);
  return oneDecimal >= 1 ? "1" : oneDecimal.toFixed(1);
};
