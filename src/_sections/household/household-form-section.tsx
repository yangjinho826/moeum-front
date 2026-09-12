"use client";

import { Stack } from "@mantine/core";
import { useTranslations } from "next-intl";

import HouseholdForm from "_features/household/components/form";
import SubHeader from "_features/layout/components/sub-header";

interface HouseholdFormSectionProps {
  householdId?: string;
}

export default function HouseholdFormSection({
  householdId,
}: HouseholdFormSectionProps) {
  const t = useTranslations("household");
  const isUpdate = Boolean(householdId);

  return (
    // 페이지 모드(fallback 라우트) — Card 없이 모달과 같은 폭 560 (DESIGN §5 시트·모달)
    <Stack gap="md" maw={560}>
      <SubHeader
        title={isUpdate ? t("form_update_title") : t("form_create_title")}
      />
      <HouseholdForm householdId={householdId} />
    </Stack>
  );
}
