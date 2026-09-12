"use client";

import { Box, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { type SemanticColor, semanticColor } from "_styles/semantic-color";

import DynamicIcon, { isKnownIcon } from "./dynamic-icon";

export interface ListRowBar {
  /** 0~1 비율 */
  ratio: number;
  /** 막대 색(기본 accent) */
  color?: SemanticColor;
}

/** 행 앞 18px 아이콘 글리프 — 카테고리·고정지출 관리 목록(배치4, Figma ListRow Lead). 색 = 사용자 데이터 hex */
export interface ListRowLead {
  /** DynamicIcon 키. 없거나 선택기 목록 밖 이름이면 같은 자리에 6px 색 점 */
  icon?: string | null;
  /** 없으면 dim */
  color?: string | null;
}

export interface ListRowProps {
  /** 제목 15/500 */
  title: ReactNode;
  /** 제목 앞 6px 색 점 — 구성 막대(CompositionBar)와 짝 */
  titleDot?: SemanticColor;
  /** 제목 옆 태그(고정지출 등). warning 색 11px */
  tag?: ReactNode;
  /** 행 앞 아이콘 — 관리 목록에서 사용자가 고른 아이콘을 보여줄 때만(명세서 행은 쓰지 않음) */
  lead?: ListRowLead;
  /** 메타 11 dimmed — 카테고리 · 날짜 · 통장 */
  meta?: ReactNode;
  /** 메타 앞 6px 점(카테고리 색 hex). 아이콘 박스는 쓰지 않는다 */
  dot?: string | null;
  /** 우측 금액 모노 14/600 */
  value?: ReactNode;
  /** 금액 색(기본 text) */
  valueColor?: SemanticColor;
  /** 금액 아래 모노 11 — 잔액·비율(기본 dim) */
  sub?: ReactNode;
  subColor?: SemanticColor;
  /** 2px 비율 막대(트랙 120 · sub 와 같이 있으면 80) */
  bar?: ListRowBar;
  /** 우측 chevron 18 */
  chevron?: boolean;
  /** 52px 터치 주요 행(기본 46) */
  tall?: boolean;
  /** 마지막 행이면 하단 구분선 생략 */
  last?: boolean;
  href?: string;
  onClick?: () => void;
}

/**
 * ListRow — 46px 명세서 행 (DESIGN.md §5, Figma ListRow 11:2).
 * 좌: 제목(+태그) / 메타. 우: 금액(의미색) / sub / 비율 막대 / chevron.
 * 행 구분은 `--moeum-hair-2`, press 배경은 `--moeum-surface-2`. 아이콘 박스 없음.
 */
export default function ListRow({
  title,
  titleDot,
  lead,
  tag,
  meta,
  dot,
  value,
  valueColor = "text",
  sub,
  subColor = "dim",
  bar,
  chevron = false,
  tall = false,
  last = false,
  href,
  onClick,
}: ListRowProps) {
  const interactive = Boolean(href || onClick);

  const body = (
    <Group
      justify="space-between"
      align="center"
      wrap="nowrap"
      gap="sm"
      style={{
        minHeight: tall ? 52 : 46,
        borderBottom: last ? undefined : "1px solid var(--moeum-hair-2)",
      }}
    >
      <Group gap={12} wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
        {lead && <LeadGlyph lead={lead} />}
        <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
          <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
            {titleDot && (
              <Box
                w={6}
                h={6}
                style={{ borderRadius: 3, background: semanticColor(titleDot), flexShrink: 0 }}
              />
            )}
            <Text
              fw={500}
              c="var(--moeum-text)"
              truncate
              style={{ fontSize: 15, lineHeight: "23px" }}
            >
              {title}
            </Text>
            {tag != null && (
              <Text
                component="span"
                fw={600}
                style={{
                  fontSize: 11,
                  lineHeight: "16px",
                  color: "var(--mantine-color-warning-5)",
                  flexShrink: 0,
                }}
              >
                {tag}
              </Text>
            )}
          </Group>
          {meta != null && (
            <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
              {dot && (
                <Box
                  w={6}
                  h={6}
                  style={{ borderRadius: 3, background: dot, flexShrink: 0 }}
                />
              )}
              <Text
                c="dimmed"
                truncate
                style={{ fontSize: 11, lineHeight: "16px", letterSpacing: 0 }}
              >
                {meta}
              </Text>
            </Group>
          )}
        </Stack>
      </Group>

      <Group gap={8} wrap="nowrap" align="center" style={{ flexShrink: 0 }}>
        {(value != null || sub != null || bar) && (
          <Stack gap={4} align="flex-end">
            {value != null && (
              <Text
                className="moeum-mono"
                fw={600}
                ta="right"
                style={{
                  fontSize: 14,
                  lineHeight: "20px",
                  color: semanticColor(valueColor),
                  whiteSpace: "nowrap",
                }}
              >
                {value}
              </Text>
            )}
            {/* sub 와 막대는 한 줄 — 행 높이 46 유지(값 20 + 4 + 16) */}
            {(sub != null || bar) && (
              <Group gap={8} wrap="nowrap" align="center">
                {sub != null && (
                  <Text
                    className="moeum-mono moeum-label"
                    fw={600}
                    ta="right"
                    style={{
                      color: semanticColor(subColor),
                      whiteSpace: "nowrap",
                    }}
                  >
                    {sub}
                  </Text>
                )}
                {bar && (
                  <Box
                    w={sub != null ? 80 : 120}
                    h={2}
                    style={{ background: "var(--moeum-hair-2)", overflow: "hidden" }}
                  >
                    <Box
                      h={2}
                      style={{
                        width: `${Math.max(0, Math.min(1, bar.ratio)) * 100}%`,
                        background: semanticColor(bar.color ?? "accent"),
                      }}
                    />
                  </Box>
                )}
              </Group>
            )}
          </Stack>
        )}
        {chevron && (
          <IconChevronRight size={18} stroke={2} color="var(--moeum-text-dim)" />
        )}
      </Group>
    </Group>
  );

  if (!interactive) return body;

  const pressStyle: CSSProperties = { display: "block", width: "100%" };
  if (href) {
    return (
      <UnstyledButton
        component={Link}
        href={href}
        prefetch={false}
        className="moeum-row-press"
        style={pressStyle}
      >
        {body}
      </UnstyledButton>
    );
  }
  return (
    <UnstyledButton onClick={onClick} className="moeum-row-press" style={pressStyle}>
      {body}
    </UnstyledButton>
  );
}

/** 18px 글리프(stroke 1.5 — Figma Icon/* 와 같은 굵기). 아이콘 없는·목록 밖 이름은 요술봉 대신 자리만 맞추고 색 점 */
function LeadGlyph({ lead }: { lead: ListRowLead }) {
  const color = lead.color ?? "var(--moeum-text-dim)";
  return (
    <Box w={18} h={18} style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color }}>
      {isKnownIcon(lead.icon) ? (
        <DynamicIcon name={lead.icon} size={18} stroke={1.5} />
      ) : (
        <Box w={6} h={6} style={{ borderRadius: 3, background: color }} />
      )}
    </Box>
  );
}
