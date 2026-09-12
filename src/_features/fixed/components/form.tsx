"use client";

import { NumberInput, Select, Stack, Switch, TextInput } from "@mantine/core";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { queryKeys } from "_constants/queries";
import ColorPicker from "_features/common/components/color-picker";
import FormActions from "_features/common/components/form-actions";
import IconPicker from "_features/common/components/icon-picker";
import InputUnit from "_features/common/components/input-unit";

import { useFixedForm } from "../hooks/use-sub/use-form";

interface FixedFormProps {
  fixedId?: string;
  /** 시트에서 사용 시 — 성공·취소 후 호출(시트 close) */
  onDone?: () => void;
  /** 시트(FormSheet) 안에서 쓸 때 — 푸터 sticky. 페이지 모드 폭은 폼 섹션(앱 격자 좌 칼럼)이 잡는다 */
  inSheet?: boolean;
}

/**
 * 고정지출 폼 (plan/5.md, Figma 73:297 · 73:406) — 이름 · 카테고리 · 결제일 · 색 · 아이콘 · (수정) 보관.
 * 금액은 백엔드에 없어 받지 않는다. 색·아이콘을 비우면 목록이 카테고리 것을 쓴다(fixed-section lead).
 * 비우기는 추가 때만 — 백엔드 수정은 null 을 "안 바꿈"으로 받아 수정에서 비우면 저장되지 않는다(qa/5 보류).
 */
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

  // 지출 카테고리만 — 거래 폼과 같은 옵션 조회(한 번 받으면 캐시 공유)
  const { data: optionsData } = useSuspenseQuery(queryKeys.transaction.formOptions());
  const categoryOptions = useMemo(
    () =>
      optionsData.body.data.categories
        .filter((c) => c.kind === "EXPENSE")
        .map((c) => ({ value: c.categoryId, label: c.name })),
    [optionsData],
  );
  const noCategory = categoryOptions.length === 0;

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      {/* 간격 14 — 폼 공통 리듬 (DESIGN §5) */}
      <Stack gap={14}>
        <TextInput
          {...form.getInputProps("name")}
          label={t("name")}
          placeholder={t("name_placeholder")}
          data-autofocus={isUpdate ? undefined : true}
        />
        <Select
          {...form.getInputProps("categoryId")}
          label={t("category")}
          placeholder={noCategory ? t("category_empty") : t("category_placeholder")}
          description={t("category_desc")}
          inputWrapperOrder={["label", "input", "description", "error"]}
          data={categoryOptions}
          disabled={noCategory}
          searchable
          clearable={!isUpdate}
        />
        <NumberInput
          {...form.getInputProps("dayOfMonth")}
          label={t("day_of_month")}
          min={1}
          max={31}
          clampBehavior="strict"
          allowDecimal={false}
          allowNegative={false}
          rightSection={t("day_unit") ? <InputUnit>{t("day_unit")}</InputUnit> : undefined}
          rightSectionPointerEvents="none"
        />
        <ColorPicker
          value={form.values.color}
          onChange={(c) => form.setFieldValue("color", c)}
          onClear={isUpdate ? undefined : () => form.setFieldValue("color", null)}
          label={t("color")}
          description={isUpdate ? undefined : t("look_desc")}
        />
        <IconPicker
          value={form.values.icon}
          onChange={(i) => form.setFieldValue("icon", i)}
          onClear={isUpdate ? undefined : () => form.setFieldValue("icon", null)}
          label={t("icon")}
        />
        {/* 보관 = 거래 기록 선택지에서만 빠짐(백엔드 form-options is_archived=False). 새로 만들 땐 의미 없어 수정만 */}
        {isUpdate && (
          <Switch
            {...form.getInputProps("isArchived", { type: "checkbox" })}
            label={t("archived")}
            description={t("archived_desc")}
            labelPosition="left"
            styles={{ body: { justifyContent: "space-between", gap: 12 }, labelWrapper: { flex: 1 } }}
          />
        )}
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
