"use client";

import { Stack } from "@mantine/core";
import { useTranslations } from "next-intl";

import CategoryForm from "_features/category/components/form";
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
    // 페이지 모드(fallback 라우트) — Card 없이 모달과 같은 폭 560 (DESIGN §5 시트·모달)
    <Stack gap="md" maw={560}>
      <SubHeader
        title={isUpdate ? t("form_update_title") : t("form_create_title")}
      />
      <CategoryForm categoryId={categoryId} />
    </Stack>
  );
}
