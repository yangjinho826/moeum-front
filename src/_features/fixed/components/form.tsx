"use client";

import { NumberInput, Stack, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";

import ColorPicker from "_features/common/components/color-picker";
import FormActions from "_features/common/components/form-actions";
import IconPicker from "_features/common/components/icon-picker";

import { useFixedForm } from "../hooks/use-sub/use-form";

interface FixedFormProps {
  fixedId?: string;
  /** 시트에서 사용 시 — 성공·취소 후 호출(시트 close) */
  onDone?: () => void;
  /** 시트(FormSheet) 안에서 쓸 때 — 푸터 sticky. 페이지 모드 폭(560)은 폼 섹션이 잡는다 */
  inSheet?: boolean;
}

export default function FixedForm({
  fixedId,
  onDone,
  inSheet = false,
}: FixedFormProps) {
  const t = useTranslations("fixed");
  const tg = useTranslations("general.common");

  const {
    form,
    isUpdate,
    isPending,
    handleSubmit,
    handleRemove,
    handleCancel,
  } = useFixedForm({ fixedId, onDone });

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="sm">
        <TextInput
          {...form.getInputProps("name")}
          label={t("name")}
          placeholder={t("name_placeholder")}
        />
        <NumberInput
          {...form.getInputProps("amount")}
          label={t("amount")}
          thousandSeparator=","
        />
        <NumberInput
          {...form.getInputProps("dayOfMonth")}
          label={t("day_of_month")}
          min={1}
          max={31}
        />
        <ColorPicker
          value={form.values.color}
          onChange={(c) => form.setFieldValue("color", c)}
          label={t("color")}
        />
        <IconPicker
          value={form.values.icon}
          onChange={(i) => form.setFieldValue("icon", i)}
          label={t("icon")}
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
