"use client";

import { Input, NumberInput, SegmentedControl, Stack, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useId, useMemo } from "react";

import ColorPicker from "_features/common/components/color-picker";
import FormActions from "_features/common/components/form-actions";
import InputUnit from "_features/common/components/input-unit";
import IconPicker from "_features/common/components/icon-picker";
import { useEnumOptions } from "_features/enum/queries/use-query";

import { isAccountType } from "../constants";
import { useAccountForm } from "../hooks/use-sub/use-form";

interface AccountFormProps {
  accountId?: string; // 있으면 update, 없으면 create
  /** 시트에서 사용 시 — 성공·취소 후 호출(시트 close) */
  onDone?: () => void;
  /** 시트(FormSheet) 안에서 쓸 때 — 푸터 sticky. 페이지 모드 폭은 폼 섹션(앱 격자 좌 칼럼)이 잡는다 */
  inSheet?: boolean;
}

/**
 * 사용자가 직접 만들 수 있는 통장 타입.
 * 부동산·연금·금·적금(SAVINGS_ASSET) 등 수동자산 전용계좌는 자산 화면에서 생성하므로 제외.
 */
const CREATABLE_ACCOUNT_TYPES = ["LIVING", "SAVINGS", "INVESTMENT"] as const;

export default function AccountForm({
  accountId,
  onDone,
  inSheet = false,
}: AccountFormProps) {
  const t = useTranslations("account");
  const tType = useTranslations("enum.account-type");
  const tg = useTranslations("general.common");
  const tGeneral = useTranslations("general");
  const typeLabelId = useId();

  const { form, isUpdate, isPending, handleSubmit, handleRemove, handleCancel } =
    useAccountForm({ accountId, onDone });

  const { data: typeData } = useEnumOptions("account-type");
  const typeOptions = useMemo(
    () =>
      (typeData.body.data ?? [])
        .filter((v) =>
          (CREATABLE_ACCOUNT_TYPES as readonly string[]).includes(v),
        )
        .map((v) => ({ value: v, label: tType(v) })),
    [typeData, tType],
  );

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap={14}>
        <TextInput
          {...form.getInputProps("name")}
          label={t("name")}
          placeholder={t("name_placeholder")}
          data-autofocus={isUpdate ? undefined : true}
        />
        {/* 유형 3개라 세그먼트로 한 번에 — 거래 폼 유형과 같은 패턴 (Figma 60:77 Field/유형) */}
        <Input.Wrapper
          label={t("type")}
          labelElement="div"
          labelProps={{ id: typeLabelId }}
          error={form.errors.accountType}
        >
          <SegmentedControl
            fullWidth
            aria-labelledby={typeLabelId}
            value={form.values.accountType}
            onChange={(v) => {
              if (isAccountType(v)) form.setFieldValue("accountType", v);
            }}
            data={typeOptions}
          />
        </Input.Wrapper>
        <NumberInput
          {...form.getInputProps("startBalance")}
          // 화면만 빈칸 + placeholder "0". 빈 칸만 0 — "-" 같은 입력 중 문자열은 그대로(음수 잔액 입력, 배치3 S6 B-1)
          value={form.values.startBalance || ""}
          onChange={(v) => form.getInputProps("startBalance").onChange(v === "" ? 0 : v)}
          label={t("balance")}
          placeholder={t("balance_placeholder")}
          thousandSeparator=","
          rightSection={<InputUnit>{tGeneral("won")}</InputUnit>}
          rightSectionPointerEvents="none"
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
