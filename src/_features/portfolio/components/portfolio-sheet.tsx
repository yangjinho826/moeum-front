"use client";

import { useTranslations } from "next-intl";

import FormSheet from "_features/common/components/form-sheet";
import PortfolioForm from "_features/portfolio/components/form";
import { usePortfolioSheetStore } from "_features/portfolio/store";

/**
 * 종목 추가/수정 시트 — UserShell 에 상시 마운트.
 * 어디서든 store.open(editId?, accountId?) 로 연다(투자 메인·계좌 상세·종목 매매화면).
 */
export default function PortfolioSheet() {
  const t = useTranslations("portfolio");
  const opened = usePortfolioSheetStore((s) => s.opened);
  const editId = usePortfolioSheetStore((s) => s.editId);
  const defaultAccountId = usePortfolioSheetStore((s) => s.defaultAccountId);
  const close = usePortfolioSheetStore((s) => s.close);

  return (
    <FormSheet
      opened={opened}
      onClose={close}
      title={editId ? t("form_update_title") : t("form_create_title")}
    >
      <PortfolioForm
        portfolioId={editId ?? undefined}
        defaultAccountId={defaultAccountId ?? undefined}
        onDone={close}
        inSheet
      />
    </FormSheet>
  );
}
