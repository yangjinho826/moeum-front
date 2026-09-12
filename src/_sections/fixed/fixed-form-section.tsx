"use client";

import { Stack } from "@mantine/core";
import { useTranslations } from "next-intl";

import FixedForm from "_features/fixed/components/form";
import SubHeader from "_features/layout/components/sub-header";

interface FixedFormSectionProps {
  fixedId?: string;
}

export default function FixedFormSection({ fixedId }: FixedFormSectionProps) {
  const t = useTranslations("fixed");
  const isUpdate = Boolean(fixedId);

  return (
    // 페이지 모드(fallback 라우트) — 앱 격자 그대로 좌 폼 칼럼. 우 레일 도움말은 이 폼 배치에서 문구와 함께 (배치4, DESIGN §5 폼 필드)
    <div className="moeum-main-rail">
      <Stack gap="md">
        <SubHeader
          title={isUpdate ? t("form_update_title") : t("form_create_title")}
        />
        <FixedForm fixedId={fixedId} />
      </Stack>
    </div>
  );
}
