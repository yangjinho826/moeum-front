"use client";

import { Text } from "@mantine/core";
import type { ReactNode } from "react";

/**
 * 인풋 우측 단위(원 · 주 · 일) — dim 13 (DESIGN §5 폼 필드). NumberInput `rightSection` 에 넣고
 * 누르면 인풋에 포커스가 가도록 `rightSectionPointerEvents="none"` 을 같이 준다 (배치3 H-304 추출).
 */
export default function InputUnit({ children }: { children: ReactNode }) {
  return (
    <Text c="dimmed" fw={500} style={{ fontSize: 13, lineHeight: "19px" }}>
      {children}
    </Text>
  );
}
