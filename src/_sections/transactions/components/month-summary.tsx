"use client";

import { Collapse, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import ListRow from "_features/common/components/list-row";
import StatGrid from "_features/common/components/stat-grid";
import { savingRate, topExpenseCategories } from "_features/stats/utils";
import { queryKeys } from "_constants/queries";
import { amountColor } from "_styles/semantic-color";
import { fmt, fmtPct } from "_utilities/fmt";

const TOP_CATEGORY_COUNT = 5;

interface MonthSummaryProps {
  year: number;
  month: number;
  /** 통장 필터 — 좌측 목록과 같은 통장. 없으면 가구 전체 */
  accountId?: string;
  /** 지출 Top5 접힘 토글 표시(모바일). 데스크톱 레일은 false + ExpenseTop 별도 */
  showTop?: boolean;
  /** 드릴다운 중인 카테고리 — 그 행을 눌린 상태로 표시 */
  selectedCategoryId?: string;
  /** 행 클릭 = 목록을 그 카테고리로 좁힘(같은 걸 다시 누르면 해제) */
  onSelectCategory?: (categoryId: string | undefined) => void;
}

/**
 * 이번 달 요약 — 수입/지출/저축률 StatGrid + 접히는 지출 Top5 (Figma 22:105 · 22:115).
 * 리스트/캘린더 뷰 공통 상단.
 *
 * 목록·달력과 **같은 calendarFull 응답**을 본다. stats/monthly 로 따로 조회하면 같은 숫자를
 * 백엔드 코드 경로 둘이 각각 계산하게 되어, 한쪽만 손대는 순간 좌우 불일치가 조용히 돌아온다.
 */
export default function MonthSummary({
  year,
  month,
  accountId,
  showTop = true,
  selectedCategoryId,
  onSelectCategory,
}: MonthSummaryProps) {
  const t = useTranslations("transaction");
  const [opened, setOpened] = useState(false);

  const { data } = useSuspenseQuery(
    queryKeys.transaction.calendarFull({ year, month, accountId }),
  );
  const stats = data.body.data;

  const income = stats.monthlyIncome;
  const expense = stats.monthlyExpense;
  const rate = savingRate(income, expense);

  const topExpenses = topExpenseCategories(stats.byCategory, TOP_CATEGORY_COUNT);

  return (
    <Stack gap={0}>
      <StatGrid
        items={[
          { label: t("summary_income"), value: fmt(income), color: amountColor(income, "income") },
          { label: t("summary_expense"), value: fmt(expense), color: amountColor(expense, "expense") },
          { label: t("summary_saving_rate"), value: fmtPct(rate) },
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
                current={cat.categoryId === selectedCategoryId}
                onClick={
                  onSelectCategory
                    ? () =>
                        onSelectCategory(
                          cat.categoryId === selectedCategoryId ? undefined : cat.categoryId,
                        )
                    : undefined
                }
                last={i === topExpenses.length - 1}
              />
            ))}
          </Collapse>
        </>
      )}
    </Stack>
  );
}
