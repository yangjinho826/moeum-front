"use client";

import { UnstyledButton } from "@mantine/core";

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

/**
 * 필터 칩 — 활성 = accent 텍스트 + 하단 2px 언더라인, 배경 채움 없음 (DESIGN.md §5).
 * 페이지 상단 필터(전체/지출/수입 등) 공통.
 */
export default function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <UnstyledButton
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        color: active ? "var(--moeum-accent)" : "var(--moeum-text-dim)",
        fontSize: 13,
        lineHeight: "19px",
        fontWeight: 700,
        letterSpacing: "-0.01em",
        // 좁은 flex 컨테이너(ScrollArea 안 nowrap Group)에서 칩이 눌리지 않게
        whiteSpace: "nowrap",
        flexShrink: 0,
        // 터치타깃 ≥32: 텍스트 19 + 언더라인 2 + 위 6/아래 5 패딩(밑줄이 칩 하단에 붙게 아래는 짧게)
        paddingTop: 6,
        paddingBottom: 5,
        // 가로도 ≥32("전체" 22px) — 좌우 6 패딩을 음수 마진으로 상쇄해 글자 위치·칩 간격은 그대로
        paddingInline: 6,
        marginInline: -6,
        transition: "color 150ms ease-out",
      }}
    >
      {label}
      <span
        style={{
          display: "block",
          height: 2,
          background: active ? "var(--moeum-accent)" : "transparent",
        }}
      />
    </UnstyledButton>
  );
}

export type ArchiveFilter = "all" | "active" | "archived";

/** ArchiveFilter → isArchived 쿼리 파라미터 변환 */
export function toIsArchivedParam(filter: ArchiveFilter): boolean | undefined {
  if (filter === "active") return false;
  if (filter === "archived") return true;
  return undefined;
}
