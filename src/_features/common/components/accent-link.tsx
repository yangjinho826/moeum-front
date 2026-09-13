"use client";

import { UnstyledButton } from "@mantine/core";
import Link from "next/link";
import type { ReactNode } from "react";

interface AccentLinkProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  /** section = 섹션 헤더 우측 12/600 · header = 페이지·서브 헤더 우측 13/700 (DESIGN §5, handoff) */
  variant?: "section" | "header";
}

const SIZE = {
  section: { fontSize: 12, lineHeight: "16px", fontWeight: 600 },
  header: { fontSize: 13, lineHeight: "19px", fontWeight: 700 },
} as const;

/**
 * accent 텍스트 링크 — 섹션·헤더 우측 행동("+ 추가", "수정", "전체").
 * 글자는 작아도 히트영역 32px — 위아래 8 패딩을 음수 마진으로 상쇄해 행 높이는 그대로(DESIGN §4).
 */
export default function AccentLink({ children, href, onClick, variant = "section" }: AccentLinkProps) {
  const style = {
    ...SIZE[variant],
    color: "var(--moeum-accent)",
    flexShrink: 0,
    padding: "8px 0 8px 12px",
    margin: "-8px 0",
  } as const;
  if (href) {
    return (
      <UnstyledButton component={Link} href={href} prefetch={false} style={style}>
        {children}
      </UnstyledButton>
    );
  }
  return (
    <UnstyledButton onClick={onClick} style={style}>
      {children}
    </UnstyledButton>
  );
}
