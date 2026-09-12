"use client";

import { Group, Skeleton, Stack } from "@mantine/core";

interface SectionSkeletonProps {
  /** 컴팩트 hero 자리 — 라벨 · 금액 28 · 델타 */
  hero?: boolean;
  /** 추이 차트 자리(140) */
  chart?: boolean;
  /** 46px 행 자리 개수 */
  rows?: number;
}

/**
 * 로딩 자리표시 — 실제 레이아웃(hero 28 + 행 46)과 같은 모양이라 로드 후 내용이 튀지 않는다
 * (plan/2.md 로딩 상태, handoff States). 페이지 Suspense 는 `hero rows={3}`, 보조 섹션은 `rows` 만.
 */
export default function SectionSkeleton({ hero = false, chart = false, rows = 0 }: SectionSkeletonProps) {
  return (
    <Stack gap={0} aria-busy="true">
      {hero && (
        <Stack gap={10} py={16}>
          <Skeleton h={12} w={72} radius="sm" />
          <Skeleton h={28} w={200} radius="sm" />
          <Skeleton h={14} w={140} radius="sm" />
        </Stack>
      )}
      {chart && <Skeleton h={140} radius="sm" my={12} />}
      {Array.from({ length: rows }, (_, i) => (
        <Group
          key={i}
          h={46}
          justify="space-between"
          wrap="nowrap"
          style={{ borderBottom: i < rows - 1 ? "1px solid var(--moeum-hair-2)" : undefined }}
        >
          <Skeleton h={14} w="40%" radius="sm" />
          <Skeleton h={14} w={80} radius="sm" />
        </Group>
      ))}
    </Stack>
  );
}
