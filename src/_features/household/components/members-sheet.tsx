"use client";

import { useTranslations } from "next-intl";

import FormSheet from "_features/common/components/form-sheet";
import SectionSkeleton from "_features/common/components/section-skeleton";
import { useMembersSheetStore } from "_features/household/store";
import MembersSection from "_sections/members/members-section";

/**
 * 멤버 관리 시트 — UserShell 에 상시 마운트. 설정에서 store.open(householdId) 로 연다.
 */
export default function MembersSheet() {
  const t = useTranslations("household.member");
  const opened = useMembersSheetStore((s) => s.opened);
  const householdId = useMembersSheetStore((s) => s.householdId);
  const close = useMembersSheetStore((s) => s.close);

  return (
    <FormSheet opened={opened} onClose={close} title={t("title")} withClose fallback={<SectionSkeleton rows={2} />}>
      {householdId && <MembersSection householdId={householdId} inSheet />}
    </FormSheet>
  );
}
