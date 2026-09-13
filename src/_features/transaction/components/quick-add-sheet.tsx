"use client";

import { ActionIcon, Tooltip } from "@mantine/core";
import { IconCopy } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import FormSheet from "_features/common/components/form-sheet";
import TransactionForm from "_features/transaction/components/form";
import { useQuickAddStore } from "_features/transaction/store";

/**
 * 거래 입력 시트 — 어디서나 FAB·거래 탭 [+]·거래 row 클릭으로 열림.
 * editId 가 있으면 수정, copyFromId 가 있으면 복사(생성), 둘 다 없으면 생성.
 * 공용 FormSheet(bottom sheet) 사용.
 */
export default function QuickAddSheet() {
  const t = useTranslations("transaction");
  const tg = useTranslations("general.common");
  const opened = useQuickAddStore((s) => s.opened);
  const editId = useQuickAddStore((s) => s.editId);
  const editTxType = useQuickAddStore((s) => s.editTxType);
  const copyFromId = useQuickAddStore((s) => s.copyFromId);
  const openCopy = useQuickAddStore((s) => s.openCopy);
  const close = useQuickAddStore((s) => s.close);

  // 캐시 무효화는 create/updateMutation.onSuccess(invalidateRelated) 가 transaction/
  // account/wealth/home/stats 까지 정교하게 처리한다. 여기서 전역 invalidateQueries() 를
  // 또 부르면 formOptions·enum 까지 불필요하게 refetch → 거래 탭 툴바가 흔들렸다.
  const handleDone = () => {
    close();
  };

  // 평가조정은 "새 평가액 절대값 → 차액" 으로 생성돼 값 복사가 무의미하다.
  const canCopy = Boolean(editId) && editTxType !== "VALUATION";

  return (
    <FormSheet
      opened={opened}
      onClose={close}
      title={
        editId
          ? t("form_update_title")
          : copyFromId
            ? t("form_copy_title")
            : t("form_create_title")
      }
      titleAction={
        canCopy ? (
          <Tooltip label={tg("copy")} withArrow>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              radius="xl"
              aria-label={tg("copy")}
              onClick={() => openCopy(editId as string)}
            >
              <IconCopy size={18} />
            </ActionIcon>
          </Tooltip>
        ) : undefined
      }
    >
      <TransactionForm
        // key 로 폼을 갈아끼운다 — 수정 시트에서 복사를 누르면 같은 컴포넌트가
        // 재사용돼 이전 상태(수정 모드 값)가 남는다. 수정→복사는 **같은 거래 id** 라
        // 모드 접두사가 없으면 key 가 안 바뀌어 재마운트가 일어나지 않는다.
        key={editId ? `edit-${editId}` : copyFromId ? `copy-${copyFromId}` : "create"}
        transactionId={editId ?? undefined}
        copyFromId={copyFromId ?? undefined}
        onDone={handleDone}
        inSheet
      />
    </FormSheet>
  );
}
