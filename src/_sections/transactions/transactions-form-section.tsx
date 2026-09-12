"use client";

import { Stack } from "@mantine/core";
import { useTranslations } from "next-intl";

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
    // 페이지 모드(fallback 라우트) — Card 없이 모달과 같은 폭 560 (DESIGN §5 시트·모달)
    <Stack gap="md" maw={560}>
      <SubHeader
        title={isUpdate ? t("form_update_title") : t("form_create_title")}
      />
      <TransactionForm transactionId={transactionId} />
    </Stack>
  );
}
