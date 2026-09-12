"use client";

import { NumberInput, Select, Stack, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import ColorPicker from "_features/common/components/color-picker";
import FormActions from "_features/common/components/form-actions";
import IconPicker from "_features/common/components/icon-picker";
import { useEnumOptions } from "_features/enum/queries/use-query";

import { useCategoryForm } from "../hooks/use-sub/use-form";

interface CategoryFormProps {
  categoryId?: string;
  /** 시트에서 사용 시 — 성공·취소 후 호출(시트 close) */
  onDone?: () => void;
  /** 시트(FormSheet) 안에서 쓸 때 — 푸터 sticky. 페이지 모드 폭(560)은 폼 섹션이 잡는다 */
  inSheet?: boolean;
}

export default function CategoryForm({
  categoryId,
  onDone,
  inSheet = false,
}: CategoryFormProps) {
  const t = useTranslations("category");
  const tKind = useTranslations("enum.category-kind");
  const tg = useTranslations("general.common");

  const {
    form,
    isUpdate,
    isPending,
    handleSubmit,
    handleRemove,
    handleCancel,
  } = useCategoryForm({ categoryId, onDone });

  const { data: kindData } = useEnumOptions("category-kind");
  const kindOptions = useMemo(
    () =>
      (kindData.body.data ?? []).map((v) => ({ value: v, label: tKind(v) })),
    [kindData, tKind],
  );

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="sm">
        <Select
          {...form.getInputProps("kind")}
          label={t("kind")}
          data={kindOptions}
        />
        <TextInput
          {...form.getInputProps("name")}
          label={t("name")}
          placeholder={t("name_placeholder")}
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
        <NumberInput
          {...form.getInputProps("sortOrder")}
          label={t("sort_order")}
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
