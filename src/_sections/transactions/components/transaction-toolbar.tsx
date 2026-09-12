"use client";

import { Group, ScrollArea, Select } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";

import { LEDGER_ACCOUNT_TYPES } from "_features/account/constants";
import FilterChip from "_features/common/components/filter-chip";
import { useEnumOptions } from "_features/enum/queries/use-query";
import type { TransactionFilterMode } from "_features/transaction/hooks/use-sub/use-search";
import type { TxType } from "_features/transaction/types";
import { queryKeys } from "_constants/queries";

interface TransactionToolbarProps {
  filter: TransactionFilterMode;
  accountId: string | undefined;
  onFilterChange: (next: TransactionFilterMode) => void;
  onAccountChange: (next: string | undefined) => void;
}

/**
 * 거래 필터 행 — 타입 칩(언더라인) + 통장 Select (Figma Filters 22:121).
 * 리스트 뷰에서만 — 캘린더는 calendarFull API 가 일별 합계까지 묶여 계좌 필터 미지원.
 */
export default function TransactionToolbar({
  filter,
  accountId,
  onFilterChange,
  onAccountChange,
}: TransactionToolbarProps) {
  const t = useTranslations("transaction");
  const tTxType = useTranslations("enum.tx-type");

  const { data: txTypeData } = useEnumOptions("tx-type");
  const txTypes = txTypeData.body.data as TxType[];

  const { data: formOptions } = useSuspenseQuery(queryKeys.transaction.formOptions());
  // 필터엔 전체 통장 노출 — INVESTMENT 는 잔액만 숨긴다(거래는 표시).
  const filterAccounts = formOptions.body.data.accounts;
  // 자동 선택 기본값은 현금흐름 통장 우선(없으면 첫 통장).
  const defaultAccount = useMemo(
    () =>
      filterAccounts.find((a) => LEDGER_ACCOUNT_TYPES.has(a.accountType)) ?? filterAccounts[0],
    [filterAccounts],
  );

  // 계좌 선택 필수 — 선택 안 됐으면 기본 통장 자동 선택.
  useEffect(() => {
    if (!accountId && defaultAccount) {
      onAccountChange(defaultAccount.accountId);
    }
  }, [accountId, defaultAccount, onAccountChange]);

  return (
    <Group justify="space-between" align="flex-end" gap="sm" wrap="nowrap">
      {/* 좁은 화면에서 칩이 줄바꿈/넘침 대신 가로 스크롤 — 스크롤바는 숨김 */}
      <ScrollArea type="never" style={{ flex: 1, minWidth: 0 }}>
        <Group gap="lg" wrap="nowrap">
          <FilterChip
            label={t("filter_all")}
            active={filter === "all"}
            onClick={() => onFilterChange("all")}
          />
          {txTypes.map((tp) => (
            <FilterChip
              key={tp}
              label={tTxType(tp)}
              active={filter === tp}
              onClick={() => onFilterChange(tp)}
            />
          ))}
        </Group>
      </ScrollArea>

      <Select
        value={accountId ?? null}
        onChange={(v) => v && onAccountChange(v)}
        data={filterAccounts.map((a) => ({ value: a.accountId, label: a.name }))}
        allowDeselect={false}
        rightSection={<IconChevronDown size={12} stroke={2} color="var(--moeum-text-dim)" />}
        size="sm"
        w={130}
        style={{ flexShrink: 0 }}
        styles={{ input: { height: 36, minHeight: 36, fontSize: 13 } }}
        comboboxProps={{ withinPortal: true }}
        aria-label={t("account_select")}
      />
    </Group>
  );
}
