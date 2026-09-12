"use client";

import { Collapse, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import ListRow from "_features/common/components/list-row";
import StatGrid from "_features/common/components/stat-grid";
import { topExpenseCategories } from "_features/stats/utils";
import { queryKeys } from "_constants/queries";
import { fmt } from "_utilities/fmt";

const TOP_CATEGORY_COUNT = 5;

interface MonthSummaryProps {
  year: number;
  month: number;
  /** 지출 Top5 접힘 토글 표시(모바일). 데스크톱 레일은 false + ExpenseTop 별도 */
  showTop?: boolean;
}

/**
 * 이번 달 요약 — 수입/지출/저축률 StatGrid + 접히는 지출 Top5 (Figma 22:105 · 22:115).
 * 리스트/캘린더 뷰 공통 상단. stats/monthly 의 byCategory 재사용.
 */
export default function MonthSummary({ year, month, showTop = true }: MonthSummaryProps) {
  const t = useTranslations("transaction");
  const [opened, setOpened] = useState(false);

  const { data } = useSuspenseQuery(queryKeys.stats.monthly({ year, month }));
  const stats = data.body.data;

  const income = stats.monthlyIncome;
  const expense = stats.monthlyExpense;
  const savingRate = income > 0 ? ((income - expense) / income) * 100 : 0;

  const topExpenses = topExpenseCategories(stats.byCategory, TOP_CATEGORY_COUNT);

  return (
    <Stack gap={0}>
      <StatGrid
        items={[
          { label: t("summary_income"), value: fmt(income), color: "income" },
          { label: t("summary_expense"), value: fmt(expense), color: "expense" },
          { label: t("summary_saving_rate"), value: `${savingRate.toFixed(1)}%` },
        ]}
      />
      {showTop && topExpenses.length > 0 && (
        <>
          <UnstyledButton
            onClick={() => setOpened((v) => !v)}
            aria-expanded={opened}
            style={{ alignSelf: "flex-start" }}
          >
            <Group gap={4} wrap="nowrap">
              <Text fw={700} c="var(--moeum-accent)" style={{ fontSize: 12, lineHeight: "19px" }}>
                {t("summary_top_expense")}
              </Text>
              <IconChevronDown
                size={12}
                stroke={2}
                color="var(--moeum-accent)"
                style={{
                  transform: opened ? "rotate(180deg)" : undefined,
                  transition: "transform 150ms ease-out",
                }}
              />
            </Group>
          </UnstyledButton>
          <Collapse in={opened}>
            {topExpenses.map((cat, i) => (
              <ListRow
                key={cat.categoryId}
                title={cat.name}
                dot={cat.color}
                value={fmt(cat.amount)}
                sub={expense > 0 ? `${Math.round((cat.amount / expense) * 100)}%` : undefined}
                bar={{ ratio: expense > 0 ? cat.amount / expense : 0, color: "expense" }}
                last={i === topExpenses.length - 1}
              />
            ))}
          </Collapse>
        </>
      )}
    </Stack>
  );
}
