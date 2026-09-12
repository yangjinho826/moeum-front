"use client";

import { Box } from "@mantine/core";

/** 섹션 구분 헤어라인 — 1px `--moeum-hair`, 위아래 12 (DESIGN.md §4) */
export default function Hairline({ py = 12 }: { py?: number }) {
  return (
    <Box py={py}>
      <Box h={1} bg="var(--moeum-hair)" />
    </Box>
  );
}
