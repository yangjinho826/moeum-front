"use client";

import { Box, Text } from "@mantine/core";
import { useTranslations } from "next-intl";

import Section from "./section";

export interface FormGuideItem {
  title: string;
  body: string;
}

interface FormGuideProps {
  items: FormGuideItem[];
}

/**
 * FormGuide — 폼 페이지 모드(fallback 라우트) 데스크톱 우측 레일 "도움말" (배치4, DESIGN §5 폼 필드).
 * 항목 = 제목 13/700 + 설명 12 dim, hair-2 로 구분. 시트·모달엔 넣지 않는다(좁은 화면은 폼만).
 */
export default function FormGuide({ items }: FormGuideProps) {
  const tg = useTranslations("general.common");

  return (
    <Section title={tg("guide")}>
      {items.map((it, i) => (
        <Box
          key={it.title}
          py={10}
          style={{ borderBottom: i < items.length - 1 ? "1px solid var(--moeum-hair-2)" : undefined }}
        >
          <Text fw={700} c="var(--moeum-text)" style={{ fontSize: 13, lineHeight: "19px" }}>
            {it.title}
          </Text>
          <Text c="dimmed" mt={4} style={{ fontSize: 12, lineHeight: 1.6 }}>
            {it.body}
          </Text>
        </Box>
      ))}
    </Section>
  );
}
