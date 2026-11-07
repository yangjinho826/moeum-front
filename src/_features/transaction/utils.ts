import type {
  TransactionFilterMode,
  TransactionListItemType,
  TxType,
} from "./types";

/** "YYYY-MM-DD" → "9.11" — 날짜 헤더 없는 목록의 행 메타용 */
export const shortDate = (iso: string): string =>
  `${Number(iso.slice(5, 7))}.${Number(iso.slice(8, 10))}`;

/** 거래 목록에 겹쳐 걸리는 3종 좁히기 — 툴바 칩 · 레일 달력 날짜 · 카테고리 드릴다운 */
export interface TxListQuery {
  filter?: TransactionFilterMode;
  /** "YYYY-MM-DD" — 그 날짜만 */
  date?: string | null;
  categoryId?: string;
}

/** 칩이 고른 유형에 거래가 들어가나 — 지출 칩은 고정지출도 지출이라 같이 보인다(홈 차트와 같은 기준) */
const matchesType = (filter: TransactionFilterMode, txType: TxType): boolean =>
  filter === "all" ||
  txType === filter ||
  (filter === "EXPENSE" && txType === "FIXED_EXPENSE");

/**
 * 목록 필터 — 계좌 원장과 전체 통장 목록이 **같은 규칙**을 써야 한다.
 * 한쪽에만 조건이 붙으면 통장을 바꿨을 뿐인데 목록이 달라 보이는 버그가 된다.
 */
export function filterTxns<T extends TransactionListItemType>(
  items: readonly T[],
  { filter = "all", date = null, categoryId }: TxListQuery,
): T[] {
  return items.filter(
    (it) =>
      matchesType(filter, it.txType) &&
      (!date || it.txDate.slice(0, 10) === date) &&
      (!categoryId || it.categoryId === categoryId),
  );
}

/**
 * 목록 배치 — 카테고리 드릴다운이면 금액순 평면("제일 많이 쓴 것"이 맨 위),
 * 아니면 날짜 그룹. 판별 유니온이라 호출부가 쓰지 않는 쪽을 계산해 둘 필요가 없다.
 */
export type TxLayout<T> =
  | { mode: "ranked"; rows: T[] }
  | { mode: "grouped"; groups: [string, T[]][] };

export function layoutTxns<T extends TransactionListItemType>(
  items: T[],
  categoryId: string | undefined,
): TxLayout<T> {
  return categoryId
    ? { mode: "ranked", rows: [...items].sort((a, b) => b.amount - a.amount) }
    : { mode: "grouped", groups: groupByTxDate(items) };
}

/** 날짜("YYYY-MM-DD")로 묶어 최신순 — 날짜 헤더 그룹 */
function groupByTxDate<T extends TransactionListItemType>(
  items: T[],
): [string, T[]][] {
  const map = new Map<string, T[]>();
  for (const it of items) {
    const key = it.txDate.slice(0, 10);
    const arr = map.get(key) ?? [];
    arr.push(it);
    map.set(key, arr);
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}
