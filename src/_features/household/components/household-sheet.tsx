"use client";

import { useTranslations } from "next-intl";

import FormSheet from "_features/common/components/form-sheet";
import HouseholdForm from "_features/household/components/form";
import { useHouseholdSheetStore } from "_features/household/store";

/**
 * 가계부 추가/수정 시트 — UserShell 에 상시 마운트. 어디서든 store.open(id?) 로 연다.
 */
export default function HouseholdSheet() {
  const t = useTranslations("household");
  const opened = useHouseholdSheetStore((s) => s.opened);
  const editId = useHouseholdSheetStore((s) => s.editId);
  const close = useHouseholdSheetStore((s) => s.close);

  return (
    <FormSheet
      opened={opened}
      onClose={close}
      title={editId ? t("form_update_title") : t("form_create_title")}
    >
      <HouseholdForm householdId={editId ?? undefined} onDone={close} inSheet />
    </FormSheet>
  );
}
