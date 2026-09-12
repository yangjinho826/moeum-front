"use client";

import { useTranslations } from "next-intl";

import AccountForm from "_features/account/components/form";
import { useAccountSheetStore } from "_features/account/store";
import FormSheet from "_features/common/components/form-sheet";

/**
 * 통장 추가/수정 시트 — UserShell 에 상시 마운트. 어디서든 store.open(id?) 로 연다.
 */
export default function AccountSheet() {
  const t = useTranslations("account");
  const opened = useAccountSheetStore((s) => s.opened);
  const editId = useAccountSheetStore((s) => s.editId);
  const close = useAccountSheetStore((s) => s.close);

  return (
    <FormSheet
      opened={opened}
      onClose={close}
      title={editId ? t("form_update_title") : t("form_create_title")}
    >
      <AccountForm accountId={editId ?? undefined} onDone={close} inSheet />
    </FormSheet>
  );
}
