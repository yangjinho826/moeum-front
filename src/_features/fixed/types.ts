export interface FixedSearchRequestType {
  searchTerm?: string;
  isArchived?: boolean;
}

/** 백엔드 FixedCreate/UpdateRequest 와 1:1 — 금액 필드는 백엔드에 없다(배치5 plan/5.md) */
export interface FixedBaseRequestType {
  name: string;
  dayOfMonth: number;
  categoryId?: string | null;
  color?: string | null;
  icon?: string | null;
  sortOrder: number;
  isArchived: boolean;
}

export type FixedCreateRequest = FixedBaseRequestType;

export interface FixedUpdateRequest extends FixedBaseRequestType {
  fixedId: string;
}

export interface FixedListItemType {
  fixedId: string;
  householdId: string;
  name: string;
  dayOfMonth: number;
  categoryId: string | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  categoryIcon?: string | null;
  color: string | null;
  icon: string | null;
  sortOrder: number;
  isArchived: boolean;
}

export interface FixedDetailItemType {
  fixedId: string;
  householdId: string;
  name: string;
  dayOfMonth: number;
  categoryId: string | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  categoryIcon?: string | null;
  color: string | null;
  icon: string | null;
  sortOrder: number;
  isArchived: boolean;
}
