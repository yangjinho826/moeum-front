"use client";

import { Stack, TextInput, Textarea } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useTranslations } from "next-intl";

import FormActions from "_features/common/components/form-actions";

import { useHouseholdForm } from "../hooks/use-sub/use-form";

interface HouseholdFormProps {
  householdId?: string;
  /** 시트에서 사용 시 — 성공·취소 후 호출(시트 close) */
  onDone?: () => void;
  /** 시트(FormSheet) 안에서 쓸 때 — 푸터 sticky. 페이지 모드 폭은 폼 섹션(앱 격자 좌 칼럼)이 잡는다 */
  inSheet?: boolean;
}

export default function HouseholdForm({
  householdId,
  onDone,
  inSheet = false,
}: HouseholdFormProps) {
  const t = useTranslations("household");
  const tg = useTranslations("general.common");

  const {
    form,
    isUpdate,
    isPending,
    handleSubmit,
    handleRemove,
    handleCancel,
  } = useHouseholdForm({ householdId, onDone });

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      {/* 간격 14 — 폼 공통 리듬 (DESIGN §5) · 순서 = Figma 73:541. 통화는 앱 전체가 원 단위라 받지 않는다(생성 기본 KRW, 배치5 결정) */}
      <Stack gap={14}>
        <TextInput
          {...form.getInputProps("name")}
          label={t("name")}
          placeholder={t("name_placeholder")}
          data-autofocus={isUpdate ? undefined : true}
        />
        <Textarea
          {...form.getInputProps("description")}
          // 서버 값 null 을 그대로 넘기면 uncontrolled 경고(배치3 H-307)
          value={form.values.description ?? ""}
          label={t("description")}
          placeholder={t("description_placeholder")}
          autosize
          minRows={2}
        />
        <DateInput
          value={form.values.startedAt || null}
          onChange={(value) => form.setFieldValue("startedAt", value ?? "")}
          error={form.errors.startedAt}
          label={t("started_at")}
          description={t("started_at_desc")}
          inputWrapperOrder={["label", "input", "description", "error"]}
          placeholder="YYYY.MM.DD"
          valueFormat="YYYY.MM.DD"
        />
        <FormActions
          submitLabel={isUpdate ? tg("update") : tg("create")}
          isPending={isPending}
          onCancel={handleCancel}
          cancelLabel={tg("cancel")}
          onRemove={isUpdate ? handleRemove : undefined}
          removeLabel={tg("delete")}
          sticky={inSheet}
        />
      </Stack>
    </form>
  );
}
