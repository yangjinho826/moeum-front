"use client";

import { Card, Group, Stack, Text } from "@mantine/core";
import { useTranslations } from "next-intl";

import type { AccountSnapshotMonthItem } from "_features/account-snapshot/types";
import { snapshotMonthExpense } from "_features/account-snapshot/utils";
import { fmt } from "_utilities/fmt";

interface Props {
  month: AccountSnapshotMonthItem;
}

/**
 * 추이 차트의 한 달을 탭했을 때 모달 본문 — 그달 총자산을 계좌별로 분해.
 * 제목/닫기는 감싸는 Modal 이 담당(여긴 본문만).
 */
export default function SnapshotDrilldownPanel({ month }: Props) {
  const t = useTranslations("home");
  // 잔액 큰 통장부터 — 기여도 큰 순
  const accounts = [...month.accounts].sort((a, b) => b.balance - a.balance);

  return (
    <Stack gap="sm">
      {/* 그달 총자산 + 수입/지출 흐름 */}
      <Card
        radius="lg"
        p="sm"
        shadow="none"
        style={{ background: "var(--mantine-color-gray-0)" }}
      >
        <Stack gap={6}>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              {t("drilldown_total")}
            </Text>
            <Text
              size="sm"
              fw={800}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {fmt(month.totalBalance)}
              {t("won")}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              {t("income")}
            </Text>
            <Text
              size="xs"
              fw={600}
              c="positive.6"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              +{fmt(month.totalIncome)}
              {t("won")}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              {t("expense")}
            </Text>
            <Text
              size="xs"
              fw={600}
              c="danger.5"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              −{fmt(snapshotMonthExpense(month))}
              {t("won")}
            </Text>
          </Group>
          {month.totalFixedExpense > 0 && (
            <Group justify="space-between">
              <Text size="xs" c="dimmed" pl="sm">
                {t("drilldown_fixed_expense")}
              </Text>
              <Text size="xs" c="dimmed" style={{ fontVariantNumeric: "tabular-nums" }}>
                −{fmt(month.totalFixedExpense)}
                {t("won")}
              </Text>
            </Group>
          )}
        </Stack>
      </Card>

      {/* 계좌별 잔액 */}
      <Stack gap={8}>
        {accounts.map((a) => (
          <Group key={a.accountId} justify="space-between" wrap="nowrap">
            <Text size="sm" fw={600} truncate style={{ minWidth: 0 }}>
              {a.accountName}
            </Text>
            <Text
              size="sm"
              fw={700}
              c={a.balance < 0 ? "danger.5" : undefined}
              style={{ fontVariantNumeric: "tabular-nums", flexShrink: 0 }}
            >
              {fmt(a.balance)}
              {t("won")}
            </Text>
          </Group>
        ))}
      </Stack>
    </Stack>
  );
}
