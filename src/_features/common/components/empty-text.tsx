"use client";

import { Text, UnstyledButton } from "@mantine/core";
import Link from "next/link";

interface EmptyAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyTextProps {
  message: string;
  /** 다음 행동 — 있으면 문장 뒤 accent 링크(32px 히트) */
  action?: EmptyAction;
  py?: number;
}

/**
 * EmptyText — 빈 상태 한 줄 + 행동 링크 (QA D-3). 배경·아이콘 없이 문장으로만.
 * 목록·최근 기록·보유 종목 등 빈 결과 공용.
 */
export default function EmptyText({ message, action, py = 12 }: EmptyTextProps) {
  const actionStyle = {
    fontSize: 13,
    lineHeight: "19px",
    fontWeight: 600,
    color: "var(--moeum-accent)",
    padding: "8px 4px",
    margin: "-8px -4px",
  } as const;
  return (
    <Text c="dimmed" py={py} style={{ fontSize: 13, lineHeight: "19px" }}>
      {message}
      {action && (
        <>
          {" "}
          {action.href ? (
            <UnstyledButton component={Link} href={action.href} prefetch={false} style={actionStyle}>
              {action.label}
            </UnstyledButton>
          ) : (
            <UnstyledButton onClick={action.onClick} style={actionStyle}>
              {action.label}
            </UnstyledButton>
          )}
        </>
      )}
    </Text>
  );
}
