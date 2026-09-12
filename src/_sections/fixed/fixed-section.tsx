"use client";

import { Box, Stack, Text } from "@mantine/core";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { queryKeys } from "_constants/queries";
import AccentLink from "_features/common/components/accent-link";
import { isKnownIcon } from "_features/common/components/dynamic-icon";
import EmptyText from "_features/common/components/empty-text";
import FormSheet from "_features/common/components/form-sheet";
import HeroAmount from "_features/common/components/hero-amount";
import ListRow from "_features/common/components/list-row";
import MonthPicker, { defaultYearMonth } from "_features/common/components/month-picker";
import Section from "_features/common/components/section";
import SectionBoundary from "_features/common/components/section-boundary";
import SectionSkeleton from "_features/common/components/section-skeleton";
import { useMonthLabel } from "_features/common/hooks/use-month-label";
import FixedForm from "_features/fixed/components/form";
import { useFixedSearch } from "_features/fixed/hooks/use-sub/use-search";
import type { FixedListItemType } from "_features/fixed/types";
import SubHeader from "_features/layout/components/sub-header";
import { InfiniteSentinel } from "_libraries/query/infinite-sentinel";
import { amountColor } from "_styles/semantic-color";
import { fmt } from "_utilities/fmt";

/**
 * 고정지출 관리 (plan/4.md, Figma 67:1285) — 선택 월 사용 합계 hero + 행마다 이번 달 사용액.
 * 백엔드 고정지출엔 예정 금액이 없어(이름·결제일·카테고리만) 예정 합계는 두지 않는다.
 * 월 요약은 보조 조회라 SectionBoundary 로 감싸고, 월 이동은 transition 으로 이전 화면을 유지한다.
 */
export default function FixedSection() {
  const t = useTranslations("fixed");
  const { items, hasNextPage, fetchNextPage, isFetchingNextPage } = useFixedSearch();

  const [opened, setOpened] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const openSheet = (id?: string) => {
    setEditId(id);
    setOpened(true);
  };

  // 선택 월(YYYY-MM) — 바꾸는 동안 이전 달 화면을 두고 새 달이 오면 교체(스켈레톤 깜빡임 없음)
  const [month, setMonth] = useState<string>(() => defaultYearMonth());
  const [, startTransition] = useTransition();
  const changeMonth = (next: string) => startTransition(() => setMonth(next));

  return (
    <div className="moeum-main-rail">
      <Stack gap={0}>
        <SubHeader
          title={t("list_title")}
          right={
            <AccentLink variant="header" onClick={() => openSheet()}>
              {t("add")}
            </AccentLink>
          }
        />
        <Box pt={8} pb={4} ml={-8}>
          <MonthPicker value={month} onChange={changeMonth} />
        </Box>

        {items.length === 0 ? (
          <EmptyText message={t("empty")} action={{ label: t("add"), onClick: () => openSheet() }} />
        ) : (
          <SectionBoundary loading={<SectionSkeleton hero rows={4} />}>
            <FixedMonthBody month={month} items={items} onClickRow={openSheet} />
          </SectionBoundary>
        )}

        <InfiniteSentinel hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={fetchNextPage} />

        <FormSheet
          opened={opened}
          onClose={() => setOpened(false)}
          title={editId ? t("form_update_title") : t("form_create_title")}
        >
          <FixedForm fixedId={editId} onDone={() => setOpened(false)} inSheet />
        </FormSheet>
      </Stack>

      {items.length > 0 && (
        <Box visibleFrom="lg" pt={48}>
          <SectionBoundary loading={<SectionSkeleton rows={3} />}>
            <FixedMonthRail month={month} items={items} />
          </SectionBoundary>
        </Box>
      )}
    </div>
  );
}

/** 선택 월 요약 — 사용 합계 · 기록/미기록(보관 제외 활성 항목 중 사용액 유무) */
function useFixedMonth(month: string, items: FixedListItemType[]) {
  const { data } = useSuspenseQuery(queryKeys.fixed.monthlySummary(month));
  const usages = data.body.data.usages;
  const active = items.filter((it) => !it.isArchived);
  // 사용 합계는 usages 전부(지운 항목의 이번 달 사용액도 포함 — 백엔드 합계와 같게)
  const used = Object.values(usages).reduce((sum, v) => sum + v, 0);
  const unrecorded = active.filter((it) => !usages[it.fixedId]).length;
  return { usages, used, recorded: active.length - unrecorded, unrecorded };
}

function FixedMonthBody({
  month,
  items,
  onClickRow,
}: {
  month: string;
  items: FixedListItemType[];
  onClickRow: (fixedId: string) => void;
}) {
  const t = useTranslations("fixed");
  const monthLabel = useMonthLabel();
  const { usages, used, recorded, unrecorded } = useFixedMonth(month, items);

  return (
    <>
      <HeroAmount compact label={t("month_total", { month: monthLabel(month) })} amount={used}>
        {/* 데스크톱은 레일이 기록·미기록을 말한다 */}
        <Text hiddenFrom="lg" c="dimmed" style={{ fontSize: 13, lineHeight: "19px" }}>
          {t("summary_caption", { recorded, count: unrecorded })}
        </Text>
      </HeroAmount>

      <Section
        title={
          <>
            {t("list_title")}{" "}
            <Text component="span" inherit c="dimmed" className="moeum-mono" fw={600}>
              {items.length}
            </Text>
          </>
        }
      >
        {items.map((it, i) => {
          const value = usages[it.fixedId] ?? 0;
          return (
            <ListRow
              key={it.fixedId}
              tall
              title={it.name}
              lead={{ icon: isKnownIcon(it.icon) ? it.icon : it.categoryIcon, color: it.color ?? it.categoryColor }}
              meta={[t("day_format", { day: it.dayOfMonth }), it.categoryName].filter(Boolean).join(" · ")}
              value={fmt(value)}
              valueColor={amountColor(value, "text")}
              last={i === items.length - 1}
              onClick={() => onClickRow(it.fixedId)}
            />
          );
        })}
      </Section>
    </>
  );
}

function FixedMonthRail({ month, items }: { month: string; items: FixedListItemType[] }) {
  const t = useTranslations("fixed");
  const monthLabel = useMonthLabel();
  const { used, recorded, unrecorded } = useFixedMonth(month, items);

  return (
    <Section title={monthLabel(month)}>
      <ListRow title={t("used_total")} value={fmt(used)} valueColor={amountColor(used, "text")} />
      <ListRow title={t("recorded")} value={t("count_unit", { count: recorded })} valueColor={amountColor(recorded, "text")} />
      <ListRow title={t("unrecorded")} value={t("count_unit", { count: unrecorded })} valueColor="dim" last />
    </Section>
  );
}
