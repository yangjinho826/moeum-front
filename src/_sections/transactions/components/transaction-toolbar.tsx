"use client";

import { Group, ScrollArea, Select } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import FilterChip from "_features/common/components/filter-chip";
import { useEnumOptions } from "_features/enum/queries/use-query";
import type { TransactionFilterMode, TxType } from "_features/transaction/types";
import { queryKeys } from "_constants/queries";

interface TransactionToolbarProps {
  filter: TransactionFilterMode;
  accountId: string | undefined;
  onFilterChange: (next: TransactionFilterMode) => void;
  onAccountChange: (next: string | undefined) => void;
}

/** Mantine Select 는 빈 문자열 value 를 못 다뤄서 "전체" 를 나타내는 센티넬을 쓴다 */
const ALL_ACCOUNTS = "all";

/**
 * 거래 필터 행 — 타입 칩(언더라인) + 통장 Select (Figma Filters 22:121).
 * 목록·캘린더 양쪽에 걸리고, 고른 통장은 우측 레일(요약·달력·Top5)에도 그대로 적용된다.
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
        value={accountId ?? ALL_ACCOUNTS}
        onChange={(v) =>
          onAccountChange(!v || v === ALL_ACCOUNTS ? undefined : v)
        }
        data={[
          { value: ALL_ACCOUNTS, label: t("account_all") },
          ...filterAccounts.map((a) => ({ value: a.accountId, label: a.name })),
        ]}
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
