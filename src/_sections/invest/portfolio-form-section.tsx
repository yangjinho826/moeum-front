"use client";

import { Stack } from "@mantine/core";
import { useTranslations } from "next-intl";

import SubHeader from "_features/layout/components/sub-header";
import PortfolioForm from "_features/portfolio/components/form";

interface PortfolioFormSectionProps {
  portfolioId?: string;
}

export default function PortfolioFormSection({
  portfolioId,
}: PortfolioFormSectionProps) {
  const t = useTranslations("portfolio");
  const isUpdate = Boolean(portfolioId);

  return (
    // 페이지 모드(fallback 라우트) — Card 없이 모달과 같은 폭 560, 본문 가운데 (DESIGN §5 폼 필드)
    <Stack gap="md" maw={560} w="100%" mx="auto">
      <SubHeader
        title={isUpdate ? t("form_update_title") : t("form_create_title")}
      />
      <PortfolioForm portfolioId={portfolioId} />
    </Stack>
  );
}
