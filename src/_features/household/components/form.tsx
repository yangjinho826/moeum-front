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
  /** 시트(FormSheet) 안에서 쓸 때 — 푸터 sticky. 페이지 모드 폭(560)은 폼 섹션이 잡는다 */
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
      <Stack gap="sm">
        <TextInput
          {...form.getInputProps("name")}
          label={t("name")}
          placeholder={t("name_placeholder")}
        />
        <Textarea
          {...form.getInputProps("description")}
          label={t("description")}
          autosize
          minRows={2}
        />
        <TextInput
          {...form.getInputProps("currency")}
          label={t("currency")}
          placeholder="KRW"
        />
        <DateInput
          value={form.values.startedAt || null}
          onChange={(value) => form.setFieldValue("startedAt", value ?? "")}
          error={form.errors.startedAt}
          label={t("started_at")}
          placeholder="YYYY-MM-DD"
          valueFormat="YYYY-MM-DD"
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
