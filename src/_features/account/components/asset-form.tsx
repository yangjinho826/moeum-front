"use client";

import { NumberInput, Select, Stack, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { MANUAL_ASSET_ACCOUNT_TYPES } from "_features/account/constants";
import FormActions from "_features/common/components/form-actions";
import InputUnit from "_features/common/components/input-unit";
import type { AccountListItemType } from "_features/account/types";

import { useAssetForm } from "../hooks/use-sub/use-asset-form";

interface AssetFormProps {
  /** 있으면 수정 모드 */
  account?: AccountListItemType;
  onClose?: () => void;
}

export default function AssetForm({ account, onClose }: AssetFormProps) {
  const t = useTranslations("account.asset");
  const tType = useTranslations("enum.account-type");
  const tg = useTranslations("general.common");
  const tGeneral = useTranslations("general");

  const { form, isUpdate, isPending, handleSubmit, handleRemove, handleCancel } =
    useAssetForm({ account, onClose });

  const typeOptions = useMemo(
    () =>
      MANUAL_ASSET_ACCOUNT_TYPES.map((v) => ({ value: v, label: tType(v) })),
    [tType],
  );

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="sm">
        <Select
          {...form.getInputProps("accountType")}
          label={t("type")}
          data={typeOptions}
          allowDeselect={false}
        />
        <TextInput
          {...form.getInputProps("name")}
          label={t("name")}
          placeholder={t("name_placeholder")}
        />
        <NumberInput
          {...form.getInputProps("startBalance")}
          label={t("start_balance")}
          description={isUpdate ? t("start_balance_update_help") : undefined}
          placeholder={t("start_balance_placeholder")}
          thousandSeparator=","
          min={0}
          rightSection={<InputUnit>{tGeneral("won")}</InputUnit>}
          rightSectionPointerEvents="none"
        />
        <FormActions
          submitLabel={isUpdate ? tg("update") : tg("create")}
          isPending={isPending}
          onCancel={handleCancel}
          cancelLabel={tg("cancel")}
          onRemove={isUpdate ? handleRemove : undefined}
          removeLabel={tg("delete")}
          sticky
        />
      </Stack>
    </form>
  );
}
