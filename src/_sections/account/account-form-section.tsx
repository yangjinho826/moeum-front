"use client";

import { Box, Stack } from "@mantine/core";
import { useTranslations } from "next-intl";

import AccountForm from "_features/account/components/form";
import FormGuide from "_features/common/components/form-guide";
import SubHeader from "_features/layout/components/sub-header";

interface AccountFormSectionProps {
  accountId?: string;
}

export default function AccountFormSection({
  accountId,
}: AccountFormSectionProps) {
  const t = useTranslations("account");
  const isUpdate = Boolean(accountId);

  return (
    // 페이지 모드(fallback 라우트) — 앱 격자 그대로: 좌 폼 칼럼 · 우 레일 도움말 (배치4, DESIGN §5 폼 필드)
    <div className="moeum-main-rail">
      <Stack gap="md">
        <SubHeader
          title={isUpdate ? t("form_update_title") : t("form_create_title")}
        />
        <AccountForm accountId={accountId} />
      </Stack>
      <Box visibleFrom="lg" pt={48}>
        <FormGuide
          items={[
            { title: t("type"), body: t("guide.type_body") },
            { title: t("balance"), body: t("guide.start_balance_body") },
            { title: t("guide.delete_title"), body: t("guide.delete_body") },
          ]}
        />
      </Box>
    </div>
  );
}
