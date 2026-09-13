"use client";

import { Box, Stack } from "@mantine/core";
import { useTranslations } from "next-intl";

import FormGuide from "_features/common/components/form-guide";
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
    // 페이지 모드(fallback 라우트) — 앱 격자 그대로: 좌 폼 칼럼 · 우 레일 도움말 (plan/7.md, DESIGN §5 폼 필드)
    <div className="moeum-main-rail">
      <Stack gap="md">
        <SubHeader
          title={isUpdate ? t("form_update_title") : t("form_create_title")}
        />
        <PortfolioForm portfolioId={portfolioId} />
      </Stack>
      <Box visibleFrom="lg" pt={48}>
        <FormGuide
          items={[
            { title: t("market"), body: t("guide.market_body") },
            { title: t("guide.quantity_title"), body: t("guide.quantity_body") },
            { title: t("guide.delete_title"), body: t("guide.delete_body") },
          ]}
        />
      </Box>
    </div>
  );
}
