"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import ListRow from "_features/common/components/list-row";
import Section from "_features/common/components/section";
import { topExpenseCategories } from "_features/stats/utils";
import { queryKeys } from "_constants/queries";
import { fmt } from "_utilities/fmt";

const TOP_CATEGORY_COUNT = 5;

interface ExpenseTopProps {
  year: number;
  month: number;
}

/**
 * 지출 Top5 — 데스크톱 레일에서 달력 아래 항상 펼침(토글 없음). stats/monthly 재사용(캐시 공유).
 */
export default function ExpenseTop({ year, month }: ExpenseTopProps) {
  const t = useTranslations("transaction");
  const { data } = useSuspenseQuery(queryKeys.stats.monthly({ year, month }));
  const stats = data.body.data;
  const expense = stats.monthlyExpense;
  const top = topExpenseCategories(stats.byCategory, TOP_CATEGORY_COUNT);

  if (top.length === 0) return null;
  return (
    <Section title={t("summary_top_expense")}>
      {top.map((cat, i) => (
        <ListRow
          key={cat.categoryId}
          title={cat.name}
          dot={cat.color}
          value={fmt(cat.amount)}
          sub={expense > 0 ? `${Math.round((cat.amount / expense) * 100)}%` : undefined}
          bar={{ ratio: expense > 0 ? cat.amount / expense : 0, color: "expense" }}
          last={i === top.length - 1}
        />
      ))}
    </Section>
  );
}
