"use client";

import { Box, Stack } from "@mantine/core";
import { useTranslations } from "next-intl";

import FormGuide from "_features/common/components/form-guide";
import FixedForm from "_features/fixed/components/form";
import SubHeader from "_features/layout/components/sub-header";

interface FixedFormSectionProps {
  fixedId?: string;
}

export default function FixedFormSection({ fixedId }: FixedFormSectionProps) {
  const t = useTranslations("fixed");
  const isUpdate = Boolean(fixedId);

  return (
    // 페이지 모드(fallback 라우트) — 앱 격자 그대로: 좌 폼 칼럼 · 우 레일 도움말 (DESIGN §5 폼 필드)
    <div className="moeum-main-rail">
      <Stack gap="md">
        <SubHeader
          title={isUpdate ? t("form_update_title") : t("form_create_title")}
        />
        <FixedForm fixedId={fixedId} />
      </Stack>
      <Box visibleFrom="lg" pt={48}>
        <FormGuide
          items={[
            { title: t("day_of_month"), body: t("guide.day_body") },
            { title: t("guide.used_title"), body: t("guide.used_body") },
            { title: t("guide.delete_title"), body: t("guide.delete_body") },
          ]}
        />
      </Box>
    </div>
  );
}
