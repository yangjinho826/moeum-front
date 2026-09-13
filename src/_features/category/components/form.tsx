"use client";

import { Input, NumberInput, SegmentedControl, Stack, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useId, useMemo } from "react";

import ColorPicker from "_features/common/components/color-picker";
import FormActions from "_features/common/components/form-actions";
import IconPicker from "_features/common/components/icon-picker";
import { useEnumOptions } from "_features/enum/queries/use-query";

import { useCategoryForm } from "../hooks/use-sub/use-form";
import type { CategoryKind } from "../types";

const isCategoryKind = (v: string): v is CategoryKind => v === "EXPENSE" || v === "INCOME";

interface CategoryFormProps {
  categoryId?: string;
  /** 시트에서 사용 시 — 성공·취소 후 호출(시트 close) */
  onDone?: () => void;
  /** 시트(FormSheet) 안에서 쓸 때 — 푸터 sticky. 페이지 모드 폭은 폼 섹션(앱 격자 좌 칼럼)이 잡는다 */
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

  const kindLabelId = useId();
  const { data: kindData } = useEnumOptions("category-kind");
  const kindOptions = useMemo(
    () =>
      (kindData.body.data ?? []).map((v) => ({ value: v, label: tKind(v) })),
    [kindData, tKind],
  );

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      {/* 간격 14 — 통장·매매·거래 폼과 같은 리듬 (배치3 H-302) · 순서 = Figma 67:1061 */}
      <Stack gap={14}>
        {/* 분류 2개라 Select 대신 세그먼트 (DESIGN §5 폼 필드, 배치3 H-305). 글자색 없음 — 의미색은 금액에만 */}
        <Input.Wrapper
          label={t("kind")}
          labelElement="div"
          labelProps={{ id: kindLabelId }}
          error={form.errors.kind}
        >
          <SegmentedControl
            fullWidth
            aria-labelledby={kindLabelId}
            value={form.values.kind}
            onChange={(v) => {
              if (isCategoryKind(v)) form.setFieldValue("kind", v);
            }}
            data={kindOptions}
          />
        </Input.Wrapper>
        <TextInput
          {...form.getInputProps("name")}
          label={t("name")}
          placeholder={t("name_placeholder")}
          data-autofocus={isUpdate ? undefined : true}
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
          // 상태 0 이어도 빈 칸 + placeholder "0" (DESIGN §5). 정수만이라 onChange 는 숫자 또는 ""
          value={form.values.sortOrder || ""}
          onChange={(v) => form.getInputProps("sortOrder").onChange(v === "" ? 0 : v)}
          label={t("sort_order")}
          description={t("sort_order_hint")}
          inputWrapperOrder={["label", "input", "description", "error"]}
          placeholder="0"
          allowDecimal={false}
          allowNegative={false}
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
