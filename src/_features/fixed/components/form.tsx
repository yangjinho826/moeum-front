"use client";

import { Box, CheckIcon, Group, NumberInput, Select, Stack, Switch, TextInput } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
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
  const tApp = useTranslations("app");

  const {
    form,
    isUpdate,
    isPending,
    handleSubmit,
    handleRemove,
    handleCancel,
  } = useFixedForm({ fixedId, onDone });

  // 지출 카테고리만 — 거래 폼과 같은 옵션 조회(캐시 공유). 카테고리는 선택 항목이라 비-Suspense:
  // 늦거나 실패해도 폼 전체를 가리지 않고 이 필드만 비활성
  const { data: optionsData, isPending: optionsLoading, isError: optionsFailed } = useQuery(
    queryKeys.transaction.formOptions(),
  );
  const categories = useMemo(
    () => (optionsData?.body.data.categories ?? []).filter((c) => c.kind === "EXPENSE"),
    [optionsData],
  );
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.categoryId, label: c.name })),
    [categories],
  );
  const categoryColor = useMemo(() => new Map(categories.map((c) => [c.categoryId, c.color])), [categories]);
  // 상태 안내는 설명 줄에 — 비활성 칸의 placeholder 는 대비가 낮아 읽히지 않는다
  const categoryDesc = optionsFailed
    ? tg("load_failed")
    : optionsData && categories.length === 0
      ? t("category_empty")
      : t("category_desc");

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
          placeholder={optionsLoading ? tApp("loading") : t("category_placeholder")}
          description={categoryDesc}
          inputWrapperOrder={["label", "input", "description", "error"]}
          data={categoryOptions}
          // 항목 앞 6px 색 점 = 목록 행 lead 와 같은 색(plan/5 ③). renderOption 은 체크 표시까지 대신 그린다
          renderOption={({ option, checked }) => (
            <Group gap={8} wrap="nowrap">
              {checked && <CheckIcon size={12} style={{ flexShrink: 0 }} />}
              <Box
                w={6}
                h={6}
                style={{
                  borderRadius: 3,
                  flexShrink: 0,
                  background: categoryColor.get(option.value) ?? "var(--moeum-text-dim)",
                }}
              />
              <span>{option.label}</span>
            </Group>
          )}
          disabled={categoryOptions.length === 0}
          searchable
          // 수정에선 비우기 불가 — 버튼도, 고른 항목 다시 누르기(allowDeselect)도 막는다(백엔드가 null 을 무시)
          clearable={!isUpdate}
          allowDeselect={!isUpdate}
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
