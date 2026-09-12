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
    // 페이지 모드(fallback 라우트) — 앱 격자 그대로 좌 폼 칼럼. 우 레일 도움말은 이 폼 배치에서 문구와 함께 (배치4, DESIGN §5 폼 필드)
    <div className="moeum-main-rail">
      <Stack gap="md">
        <SubHeader
          title={isUpdate ? t("form_update_title") : t("form_create_title")}
        />
        <HouseholdForm householdId={householdId} />
      </Stack>
    </div>
  );
}
