"use client";

import { Box, Stack } from "@mantine/core";
import { useTranslations } from "next-intl";

import FormGuide from "_features/common/components/form-guide";
import SubHeader from "_features/layout/components/sub-header";
import TransactionForm from "_features/transaction/components/form";

interface TransactionsFormSectionProps {
  transactionId?: string;
}

export default function TransactionsFormSection({
  transactionId,
}: TransactionsFormSectionProps) {
  const t = useTranslations("transaction");
  const isUpdate = Boolean(transactionId);

  return (
    // 페이지 모드(fallback 라우트) — 앱 격자 그대로: 좌 폼 칼럼 · 우 레일 도움말 (plan/7.md, DESIGN §5 폼 필드)
    <div className="moeum-main-rail">
      <Stack gap="md">
        <SubHeader
          title={isUpdate ? t("form_update_title") : t("form_create_title")}
        />
        <TransactionForm transactionId={transactionId} />
      </Stack>
      <Box visibleFrom="lg" pt={48}>
        <FormGuide
          items={[
            { title: t("guide.type_title"), body: t("guide.type_body") },
            { title: t("guide.balance_title"), body: t("guide.balance_body") },
            { title: t("guide.fixed_title"), body: t("guide.fixed_body") },
          ]}
        />
      </Box>
    </div>
  );
}
