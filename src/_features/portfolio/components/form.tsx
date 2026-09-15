"use client";

import {
  Box,
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
import { useFinePointer } from "_libraries/hooks/use-fine-pointer";

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
  // 터치 기기는 검색 끔 — 키보드가 드롭다운을 가림
  const canSearch = useFinePointer();

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
      {/* 간격 14 — 폼 공통 리듬 (DESIGN §5) */}
      <Stack gap={14}>
        <Select
          {...form.getInputProps("accountId")}
          label={t("account")}
          placeholder={t("account_placeholder")}
          data={investAccountOptions}
          disabled={isUpdate}
          searchable={canSearch}
        />
        <Select
          {...form.getInputProps("market")}
          label={t("market")}
          description={t("market_help")}
          inputWrapperOrder={["label", "input", "description", "error"]}
          data={marketOptions}
          allowDeselect={false}
        />
        {!isOther && (
          <TextInput
            {...form.getInputProps("code")}
            label={t("code")}
            placeholder={codePlaceholder}
            inputWrapperOrder={["label", "input", "description", "error"]}
            // 필드와 "조회" 한 줄 — 에러 줄이 생겨도 버튼은 입력칸 옆에 그대로(멤버 추가와 같은 구조)
            inputContainer={(children) => (
              <Group gap={8} wrap="nowrap" align="flex-start">
                <Box style={{ flex: 1, minWidth: 0 }}>{children}</Box>
                {/* 보조 행동 = outline(DESIGN §5 버튼), 필드와 같은 높이 44 */}
                <Button
                  type="button"
                  variant="default"
                  onClick={handleLookup}
                  loading={isLookupPending}
                  disabled={!form.values.code.trim()}
                >
                  {t("lookup")}
                </Button>
              </Group>
            )}
          />
        )}
        <TextInput
          {...form.getInputProps("name")}
          label={t("name")}
          placeholder={t("name_placeholder")}
          // 조회가 있는 시장에서만 — 기타는 조회 버튼이 없다
          description={isUpdate || isOther ? undefined : t("name_help")}
          inputWrapperOrder={["label", "input", "description", "error"]}
          disabled={isUpdate}
        />
        <NumberInput
          // 빈 칸 = "" 그대로(placeholder "0") — 수정에서 0 은 값, 비운 칸은 검증에서 막는다
          {...form.getInputProps("currentPrice")}
          label={t("current_price")}
          placeholder={t("current_price_placeholder")}
          thousandSeparator=","
          min={0}
          allowNegative={false}
          rightSection={<InputUnit>{tGeneral("won")}</InputUnit>}
          rightSectionPointerEvents="none"
          // 자동 갱신 시장은 수정에서도 알려 준다 — 직접 고친 값이 다음 갱신 때 바뀐다
          description={isOther ? t("current_price_help_other") : t("current_price_help")}
          inputWrapperOrder={["label", "input", "description", "error"]}
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
