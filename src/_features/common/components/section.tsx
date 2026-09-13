"use client";

import { Box, Group, Text } from "@mantine/core";
import type { ReactNode } from "react";

import AccentLink from "./accent-link";
import Hairline from "./hairline";

export interface SectionLink {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
}

interface SectionProps {
  /** 섹션 제목 14/700 (좌) */
  title: ReactNode;
  /** 우측 accent 링크 12/600 (DESIGN.md §5) — href 면 Link, onClick 이면 버튼 */
  link?: SectionLink;
  /** 상단 헤어라인(기본 true). 화면 첫 섹션이 hero 바로 아래면 false */
  hairline?: boolean;
  /** 제목 행 우측에 링크 대신 넣을 임의 슬롯(ActionIcon 등) */
  right?: ReactNode;
  children?: ReactNode;
}

/**
 * Section — Card 대신 쓰는 명세서 섹션 (DESIGN.md §5, Figma SectionHeader 11:9).
 * 상단 헤어라인(위아래 12) + 헤더 행(제목 좌 · 링크 우 accent) + children.
 * 배경·테두리·그림자 없음 — 헤어라인과 여백만으로 나눈다.
 */
export default function Section({
  title,
  link,
  hairline = true,
  right,
  children,
}: SectionProps) {
  return (
    <Box component="section" w="100%">
      {hairline && <Hairline />}
      <Group
        justify="space-between"
        align="baseline"
        wrap="nowrap"
        pt={6}
        pb={4}
      >
        <Text
          size="sm"
          fw={700}
          style={{ fontSize: 14, lineHeight: "20px", letterSpacing: "-0.01em" }}
          c="var(--moeum-text)"
          truncate
        >
          {title}
        </Text>
        {right ?? (link ? <SectionLinkView link={link} /> : null)}
      </Group>
      {children}
    </Box>
  );
}

function SectionLinkView({ link }: { link: SectionLink }) {
  return (
    <AccentLink href={link.href} onClick={link.onClick}>
      {link.label}
    </AccentLink>
  );
}
