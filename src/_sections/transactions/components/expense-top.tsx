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
  /** 통장 필터 — 좌측 목록과 같은 통장. 없으면 가구 전체 */
  accountId?: string;
  /** 드릴다운 중인 카테고리 — 그 행을 눌린 상태로 표시 */
  selectedCategoryId?: string;
  /** 행 클릭 = 좌측 목록을 그 카테고리로 좁힘(같은 걸 다시 누르면 해제) */
  onSelectCategory?: (categoryId: string | undefined) => void;
}

/**
 * 지출 Top5 — 데스크톱 레일에서 달력 아래 항상 펼침(토글 없음).
 * 행을 누르면 좌측 목록이 그 카테고리만 금액순으로 — 달력 날짜 선택과 같은 드릴다운 패턴.
 * 목록·달력·요약과 같은 calendarFull 응답을 본다(캐시 공유 — 이 화면 전체가 1회 조회).
 */
export default function ExpenseTop({
  year,
  month,
  accountId,
  selectedCategoryId,
  onSelectCategory,
}: ExpenseTopProps) {
  const t = useTranslations("transaction");
  const { data } = useSuspenseQuery(
    queryKeys.transaction.calendarFull({ year, month, accountId }),
  );
  const stats = data.body.data;
  const expense = stats.monthlyExpense;
  const top = topExpenseCategories(stats.byCategory, TOP_CATEGORY_COUNT);

  if (top.length === 0) return null;
  return (
    <Section
      title={t("summary_top_expense")}
      link={
        selectedCategoryId && onSelectCategory
          ? { label: t("filter_all"), onClick: () => onSelectCategory(undefined) }
          : undefined
      }
    >
      {top.map((cat, i) => (
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
          last={i === top.length - 1}
        />
      ))}
    </Section>
  );
}
