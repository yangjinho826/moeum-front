"use client";

import { Box, Stack } from "@mantine/core";
import { useTranslations } from "next-intl";

import CategoryForm from "_features/category/components/form";
import FormGuide from "_features/common/components/form-guide";
import SubHeader from "_features/layout/components/sub-header";

interface CategoryFormSectionProps {
  categoryId?: string;
}

export default function CategoryFormSection({
  categoryId,
}: CategoryFormSectionProps) {
  const t = useTranslations("category");
  const isUpdate = Boolean(categoryId);

  return (
    // 페이지 모드(fallback 라우트) — 앱 격자 그대로: 좌 폼 칼럼 · 우 레일 도움말 (배치4, DESIGN §5 폼 필드)
    <div className="moeum-main-rail">
      <Stack gap="md">
        <SubHeader
          title={isUpdate ? t("form_update_title") : t("form_create_title")}
        />
        <CategoryForm categoryId={categoryId} />
      </Stack>
      <Box visibleFrom="lg" pt={48}>
        <FormGuide
          items={[
            { title: t("kind"), body: t("guide.kind_body") },
            { title: t("sort_order"), body: t("guide.sort_body") },
            { title: t("guide.delete_title"), body: t("guide.delete_body") },
          ]}
        />
      </Box>
    </div>
  );
}
