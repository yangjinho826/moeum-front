"use client";

import { Box, Stack, Text } from "@mantine/core";
import { useTranslations } from "next-intl";

const DOW_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

interface TxDateHeaderProps {
  /** "YYYY-MM-DD" */
  date: string;
}

/**
 * 거래 목록 날짜 구분 헤더 — 모노 `09.11 목` + 헤어라인 (Figma transactions DateHeader 24:105).
 */
export default function TxDateHeader({ date }: TxDateHeaderProps) {
  const tTx = useTranslations("transaction");
  const tGeneral = useTranslations("general");

  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  const dayKey = DOW_KEYS[new Date(y, m - 1, d).getDay()] ?? "sun";

  return (
    <Stack gap={4} pt={14}>
      <Text
        className="moeum-mono moeum-label"
        fw={600}
        c="dimmed"
        style={{ textTransform: "uppercase" }}
      >
        {tTx("date_header", {
          month: String(m).padStart(2, "0"),
          day: String(d).padStart(2, "0"),
          weekday: tGeneral(`weekday.${dayKey}`),
        })}
      </Text>
      <Box h={1} bg="var(--moeum-hair)" />
    </Stack>
  );
}
