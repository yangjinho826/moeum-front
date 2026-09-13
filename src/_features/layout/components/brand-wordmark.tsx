import { Text } from "@mantine/core";
import { useTranslations } from "next-intl";

interface BrandWordmarkProps {
  /** 글자 크기 — 모바일 헤더 15 · 사이드바 18 · 로그인 28 */
  size: 15 | 18 | 28;
  /** 로그인에선 페이지 제목(h1) */
  as?: "h1" | "span";
}

const LINE_HEIGHT: Record<BrandWordmarkProps["size"], string> = { 15: "20px", 18: "24px", 28: "36px" };

/**
 * 브랜드 워드마크 "모음" — accent 800 · 자간 -0.03em (DESIGN §5 셸).
 * Mantine Text 기본 굵기·색이 전역 클래스보다 우선이라 props 로 준다(클래스로 두면 400·본문색으로 나옴).
 */
export default function BrandWordmark({ size, as = "span" }: BrandWordmarkProps) {
  const t = useTranslations("auth");
  return (
    <Text
      component={as}
      fw={800}
      c="var(--moeum-accent)"
      style={{ fontSize: size, lineHeight: LINE_HEIGHT[size], letterSpacing: "-0.03em", margin: 0 }}
    >
      {t("brand_name")}
    </Text>
  );
}
