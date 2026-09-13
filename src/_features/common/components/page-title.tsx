"use client";

import { Group, Title } from "@mantine/core";
import type { ReactNode } from "react";

interface PageTitleProps {
  title: ReactNode;
  /** 우측 슬롯(세그먼트·액션) */
  children?: ReactNode;
}

/** 페이지 타이틀 행 — 48px, 22/800 (DESIGN.md §3). 거래·투자·내정보 공용 */
export default function PageTitle({ title, children }: PageTitleProps) {
  return (
    <Group justify="space-between" align="center" wrap="nowrap" h={48}>
      <Title order={2} style={{ fontSize: 22, lineHeight: "30px", letterSpacing: "-0.03em" }}>
        {title}
      </Title>
      {children}
    </Group>
  );
}
