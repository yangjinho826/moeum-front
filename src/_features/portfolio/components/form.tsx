"use client";

import {
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";

import FormActions from "_features/common/components/form-actions";
import InputUnit from "_features/common/components/input-unit";
import { useEnumOptions } from "_features/enum/queries/use-query";

import { usePortfolioForm } from "../hooks/use-sub/use-form";
import { usePortfolioFormOptions } from "../queries/use-query";

interface PortfolioFormProps {
  portfolioId?: string;
  /** 시트에서 사용 시 — 성공·취소 후 호출(시트 close) */
  onDone?: () => void;
  /** 시트(FormSheet) 안에서 쓸 때 — 푸터 sticky. 페이지 모드 폭은 폼 섹션(앱 격자 좌 칼럼)이 잡는다 */
  inSheet?: boolean;
  /** 계좌 상세에서 추가 시 — 그 계좌로 프리필(create 전용) */
  defaultAccountId?: string;
}

export default function PortfolioForm({
  portfolioId,
  onDone,
  inSheet = false,
  defaultAccountId,
}: PortfolioFormProps) {
  const t = useTranslations("portfolio");
  const tg = useTranslations("general.common");
  const tGeneral = useTranslations("general");

  const {
    form,
    isUpdate,
    quantity,
    isPending,
    isLookupPending,
    handleLookup,
    handleSubmit,
    handleRemove,
    handleCancel,
  } = usePortfolioForm({ portfolioId, onDone });

  const tMarket = useTranslations("enum.market");
  const { data: marketData } = useEnumOptions("market");
  const marketOptions = useMemo(
    () =>
      (marketData.body.data ?? []).map((v) => ({
        value: v,
        label: tMarket(v),
      })),
    [marketData, tMarket],
  );

  const isOther = form.values.market === "OTHER";
  const codePlaceholder =
    form.values.market === "NASDAQ" || form.values.market === "NYSE"
      ? "AAPL"
      : "005930";

  // INVESTMENT 통장만 — 백엔드 form-options endpoint 가 필터해서 줌
  const { data: formOptionsData } = usePortfolioFormOptions();
  const investAccountOptions = useMemo(
    () =>
      formOptionsData.body.data.investmentAccounts.map((a) => ({
        value: a.accountId,
        label: a.name,
      })),
    [formOptionsData],
  );

  // 신규 생성 시 계좌 프리필 — 계좌 상세에서 열면 그 계좌, 아니면 INVESTMENT 1개일 때 자동 선택
  useEffect(() => {
    if (isUpdate) return;
    if (form.values.accountId) return;
    if (defaultAccountId) {
      form.setFieldValue("accountId", defaultAccountId);
      return;
    }
    if (investAccountOptions.length === 1) {
      const first = investAccountOptions[0];
      if (first) form.setFieldValue("accountId", first.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investAccountOptions, isUpdate, defaultAccountId]);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="sm">
        <Select
          {...form.getInputProps("accountId")}
          label={t("account")}
          placeholder={t("account_placeholder")}
          data={investAccountOptions}
          disabled={isUpdate}
          searchable
        />
        <Select
          {...form.getInputProps("market")}
          label={t("market")}
          description={t("market_help")}
          data={marketOptions}
          allowDeselect={false}
        />
        {!isOther && (
          <Group align="end" gap="xs" wrap="nowrap">
            <TextInput
              {...form.getInputProps("code")}
              label={t("code")}
              placeholder={codePlaceholder}
              style={{ flex: 1 }}
            />
            <Button
              type="button"
              variant="light"
              onClick={handleLookup}
              loading={isLookupPending}
              disabled={!form.values.code.trim()}
            >
              {t("lookup")}
            </Button>
          </Group>
        )}
        <TextInput
          {...form.getInputProps("name")}
          label={t("name")}
          placeholder={t("name_placeholder")}
          description={isUpdate ? undefined : t("name_help")}
          disabled={isUpdate}
        />
        <NumberInput
          {...form.getInputProps("currentPrice")}
          label={t("current_price")}
          placeholder={t("current_price_placeholder")}
          thousandSeparator=","
          min={0}
          rightSection={<InputUnit>{tGeneral("won")}</InputUnit>}
          rightSectionPointerEvents="none"
          description={isUpdate ? undefined : t("current_price_help")}
        />
        <FormActions
          submitLabel={isUpdate ? tg("update") : tg("create")}
          isPending={isPending}
          onCancel={handleCancel}
          cancelLabel={tg("cancel")}
          onRemove={isUpdate ? handleRemove : undefined}
          removeLabel={tg("delete")}
          removeDisabled={quantity > 0}
          removeHint={quantity > 0 ? t("delete_blocked_holdings") : undefined}
          sticky={inSheet}
        />
      </Stack>
    </form>
  );
}
