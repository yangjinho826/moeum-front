"use client";

import {
  Box,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconBuildingBank } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { ACCOUNT_TYPE_HEX } from "_features/account/constants";
import { useAccountSheetStore } from "_features/account/store";
import EmptyText from "_features/common/components/empty-text";
import FormActions from "_features/common/components/form-actions";
import InputUnit from "_features/common/components/input-unit";
import { useFinePointer } from "_libraries/hooks/use-fine-pointer";
import { queryKeys } from "_constants/queries";
import { semanticColor, signColor } from "_styles/semantic-color";
import { fmt } from "_utilities/fmt";

import { useTransactionForm } from "../hooks/use-sub/use-form";
import type { TxType } from "../types";

interface TransactionFormProps {
  transactionId?: string;
  /** 복사 원본 거래 id — 값만 채운 생성 모드 (날짜는 오늘) */
  copyFromId?: string;
  /** 성공/취소 후 호출. 시트 모드용. 없으면 라우트 이동 (기존 동작). */
  onDone?: () => void;
  /** 시트(FormSheet) 안에서 쓸 때 — 푸터 sticky. 페이지 모드 폭은 폼 섹션(앱 격자 좌 칼럼)이 잡는다 */
  inSheet?: boolean;
}

export default function TransactionForm({
  transactionId,
  copyFromId,
  onDone,
  inSheet = false,
}: TransactionFormProps) {
  const t = useTranslations("transaction");
  const tTxType = useTranslations("enum.tx-type");
  const tg = useTranslations("general.common");
  const tWealth = useTranslations("wealth");
  const openAccountSheet = useAccountSheetStore((s) => s.open);
  // 터치 기기는 검색 끔 — 키보드가 드롭다운을 가림
  const canSearch = useFinePointer();

  const { data: txTypeData } = useSuspenseQuery({
    ...queryKeys.enum.options("tx-type"),
    staleTime: Infinity,
    gcTime: Infinity,
  });
  // VALUATION(평가조정)은 통장 선택으로 자동 분기 — 유형 Select 에는 노출하지 않는다.
  const txTypeOptions = useMemo(
    () =>
      (txTypeData.body.data ?? [])
        .filter((v) => v !== "VALUATION")
        .map((v) => ({
          value: v,
          label: tTxType(v),
        })),
    [txTypeData, tTxType],
  );

  // 통장 + 카테고리 + 고정지출 — 폼 옵션 1호출. 훅보다 먼저 읽어 accounts 를 넘긴다.
  const { data: optionsData } = useSuspenseQuery(
    queryKeys.transaction.formOptions(),
  );
  const accounts = optionsData.body.data.accounts;
  const categories = optionsData.body.data.categories;
  const fixedItems = optionsData.body.data.fixedExpenses;

  const {
    form,
    isUpdate,
    isPending,
    selectedAccount,
    handleSubmit,
    handleRemove,
    handleCancel,
  } = useTransactionForm({ transactionId, copyFromId, accounts, onDone });

  const txType = form.values.txType;
  const isValuation = txType === "VALUATION";
  const isTransfer = txType === "TRANSFER";
  const isFixedExpense = txType === "FIXED_EXPENSE";

  const fixedOptions = useMemo(
    () =>
      fixedItems
        .filter((f) => !f.isArchived)
        .map((f) => ({ value: f.fixedId, label: f.name })),
    [fixedItems],
  );

  const toAccountOptions = useMemo(
    () =>
      accounts
        .filter((a) => a.accountId !== form.values.accountId)
        .map((a) => ({ value: a.accountId, label: a.name })),
    [accounts, form.values.accountId],
  );

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((c) =>
          txType === "INCOME" ? c.kind === "INCOME" : c.kind === "EXPENSE",
        )
        .map((c) => ({ value: c.categoryId, label: c.name })),
    [categories, txType],
  );

  const amountNum = Number(form.values.amount) || 0;

  const selectedToAccount = useMemo(
    () => accounts.find((a) => a.accountId === form.values.toAccountId),
    [accounts, form.values.toAccountId],
  );

  // 거래 후 예상 잔액 — 수정 모드는 기존 거래가 이미 balance 에 반영돼 부정확하므로 생략.
  const renderBalanceHint = (
    account: (typeof accounts)[number] | undefined,
    delta: number,
  ) => {
    if (isUpdate || !account) return null;
    const after = account.balance + delta;
    return (
      <Text className="moeum-mono moeum-label" fw={600} c="dimmed" mt={-8}>
        {t("balance_current")} {fmt(account.balance)}
        {t("won")}
        {amountNum > 0 && (
          <>
            {" → "}
            <Text span inherit style={{ color: semanticColor(after < 0 ? "expense" : "text") }}>
              {fmt(after)}
              {t("won")}
            </Text>
          </>
        )}
      </Text>
    );
  };

  // 평가조정 생성 힌트 — 현재 잔액 + (새 평가액을 입력한 뒤에만) 증감 표시. 증감은 자산 방향색(up/down).
  const renderValuationHint = () => {
    if (isUpdate || !selectedAccount) return null;
    const valuation = Number(form.values.valuation) || 0;
    const diff = valuation - selectedAccount.balance;
    return (
      <Text className="moeum-mono moeum-label" fw={600} c="dimmed" mt={-8}>
        {t("balance_current")} {fmt(selectedAccount.balance)}
        {t("won")}
        {/* 입력 전(0)엔 현재 잔액만 — 빈 칸에서 "감소 <잔액 전부>" 가 뜨지 않게 */}
        {valuation > 0 && diff !== 0 && (
          <>
            {" · "}
            <Text span inherit style={{ color: semanticColor(signColor(diff, "asset")) }}>
              {diff > 0
                ? t("valuation_hint_increase", { amount: fmt(diff) })
                : t("valuation_hint_decrease", { amount: fmt(-diff) })}
            </Text>
          </>
        )}
      </Text>
    );
  };

  // 통장 선택 — 거래 툴바 계좌 필터와 동일한 Select 패턴. 선택된 통장 색을 leftSection 점으로 살린다.
  const selectedColor = selectedAccount
    ? selectedAccount.color ?? ACCOUNT_TYPE_HEX[selectedAccount.accountType]
    : null;

  const accountSelect = (
    <Select
      label={isTransfer ? t("from_account") : t("account")}
      placeholder={t("account_placeholder")}
      value={form.values.accountId || null}
      onChange={(value) => value && form.setFieldValue("accountId", value)}
      error={form.errors.accountId}
      data={accounts.map((a) => ({ value: a.accountId, label: a.name }))}
      allowDeselect={false}
      searchable={canSearch}
      leftSection={
        selectedColor ? (
          <Box w={8} h={8} style={{ borderRadius: 999, background: selectedColor }} />
        ) : (
          <IconBuildingBank size={15} />
        )
      }
      comboboxProps={{ withinPortal: true }}
    />
  );

  // 유형 — 지출/수입/이체(/고정 지출). 평가조정은 수동자산 통장 선택 시 자동이라 세그먼트에 없음
  const typeSegment = (
    <SegmentedControl
      fullWidth
      value={txType}
      onChange={(value) => form.setFieldValue("txType", value as TxType)}
      data={txTypeOptions}
    />
  );

  // 금액 — 큰 모노 28 · 높이 56 · 우측 "원" (Figma 46:646). 생성이면 첫 포커스.
  // 상태는 숫자 0 그대로, 화면만 빈칸 + placeholder "0" — 실제 값 "0" 을 지우고 입력하지 않게
  const amountField = (
    <NumberInput
      {...form.getInputProps("amount")}
      value={form.values.amount || ""}
      onChange={(v) => form.setFieldValue("amount", typeof v === "number" ? v : 0)}
      placeholder="0"
      label={t("amount")}
      min={0}
      classNames={{ input: "moeum-amount-input" }}
      rightSection={<InputUnit>{t("won")}</InputUnit>}
      rightSectionPointerEvents="none"
      data-autofocus={isUpdate ? undefined : true}
    />
  );

  const valuationFields = isUpdate ? (
    // 기존 평가조정 거래 수정 — 방향 + 금액 직접 편집.
    <>
      <Select
        {...form.getInputProps("valuationDirection")}
        label={t("valuation_direction")}
        data={[
          { value: "INCREASE", label: t("valuation_increase") },
          { value: "DECREASE", label: t("valuation_decrease") },
        ]}
        allowDeselect={false}
      />
      <NumberInput
        {...form.getInputProps("amount")}
        label={t("valuation_amount")}
        min={0}
        classNames={{ input: "moeum-amount-input" }}
      />
    </>
  ) : (
    // 신규 — 새 평가액(절대값) 입력 → 차액이 평가조정 거래로 생성.
    <>
      <NumberInput
        {...form.getInputProps("valuation")}
        value={form.values.valuation || ""}
        onChange={(v) => form.setFieldValue("valuation", typeof v === "number" ? v : 0)}
        label={t("valuation_new")}
        placeholder={t("valuation_new_placeholder")}
        min={0}
        classNames={{ input: "moeum-amount-input" }}
      />
      {renderValuationHint()}
    </>
  );

  // 이체면 받는 통장, 아니면 카테고리(+ 고정 지출 항목)
  const counterpartFields = isTransfer ? (
    <>
      <Select
        {...form.getInputProps("toAccountId")}
        label={t("to_account")}
        placeholder={t("account_placeholder")}
        data={toAccountOptions}
        searchable={canSearch}
      />
      {renderBalanceHint(selectedToAccount, amountNum)}
    </>
  ) : (
    <>
      <Select
        {...form.getInputProps("categoryId")}
        label={t("category")}
        placeholder={t("category_placeholder")}
        data={categoryOptions}
        searchable={canSearch}
        clearable
      />
      {isFixedExpense && (
        <Select
          {...form.getInputProps("fixedExpenseId")}
          label={t("fixed_expense_item")}
          placeholder={t("fixed_expense_item_placeholder")}
          data={fixedOptions}
          searchable={canSearch}
          required
        />
      )}
    </>
  );

  // 순서 = Figma 46:451: 유형 → 금액 → 통장(+잔액) → 카테고리/받는 통장 → 날짜 → 메모 → 푸터
  const formContent = (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap={14}>
        {isValuation ? (
          valuationFields
        ) : (
          <>
            {typeSegment}
            {amountField}
          </>
        )}

        {accountSelect}
        {!isValuation &&
          renderBalanceHint(selectedAccount, txType === "INCOME" ? amountNum : -amountNum)}

        {!isValuation && counterpartFields}

        <DateInput
          value={form.values.txDate || null}
          onChange={(value) => form.setFieldValue("txDate", value ?? "")}
          error={form.errors.txDate}
          label={t("tx_date")}
          placeholder="YYYY.MM.DD"
          valueFormat="YYYY.MM.DD"
        />
        <Textarea
          {...form.getInputProps("memo")}
          // 초기값 null 을 그대로 넘기면 React 가 controlled/uncontrolled 경고 → 빈 문자열로
          value={form.values.memo ?? ""}
          label={t("memo")}
          placeholder={t("memo_placeholder")}
          autosize
          minRows={1}
        />

        <FormActions
          submitLabel={isUpdate ? tg("update") : tg("create")}
          isPending={isPending}
          submitDisabled={!selectedAccount}
          onCancel={handleCancel}
          cancelLabel={tg("cancel")}
          onRemove={isUpdate ? handleRemove : undefined}
          removeLabel={tg("delete")}
          sticky={inSheet}
        />
      </Stack>
    </form>
  );

  // 통장 0 — 빈 Select + 비활성 버튼 막다른 길 대신 다음 행동을 준다(plan/2.md 빈 상태)
  if (accounts.length === 0) {
    const empty = (
      <EmptyText
        message={t("need_account")}
        action={{
          label: tWealth("add_account"),
          onClick: () => {
            handleCancel();
            openAccountSheet();
          },
        }}
      />
    );
    return empty;
  }

  return formContent;
}
