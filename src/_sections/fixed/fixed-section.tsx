"use client";

import { Box, Stack, Text } from "@mantine/core";
import { keepPreviousData, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useDeferredValue, useState } from "react";

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
 * 월 요약은 보조 조회 — hero·레일만 SectionBoundary 로 감싸고, 행(수정 진입)은 요약이 늦거나 실패해도 남긴다.
 */
export default function FixedSection() {
  const t = useTranslations("fixed");
  const monthLabel = useMonthLabel();
  const { locale } = useParams<{ locale: string }>();
  const { items, hasNextPage, fetchNextPage, isFetchingNextPage } = useFixedSearch();

  const [opened, setOpened] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const openSheet = (id?: string) => {
    setEditId(id);
    setOpened(true);
  };

  // 선택 월(YYYY-MM)은 바로 바꾸고(연타해도 달이 빠지지 않게) 요약은 지연값 — 새 달이 오기 전까지 이전 달을 흐리게 둔다
  // (realized-pnl-panel 과 같은 방식)
  const [month, setMonth] = useState<string>(() => defaultYearMonth());
  const shownMonth = useDeferredValue(month);
  const stale = month !== shownMonth;

  return (
    <div className="moeum-main-rail">
      <Stack gap={0}>
        <SubHeader
          title={t("list_title")}
          // 내정보 "관리"의 하위 화면 — 새로고침·직접 진입에서도 뒤로 = 내정보 (멤버 화면과 같게)
          back={`/${locale}/settings`}
          right={
            <AccentLink variant="header" onClick={() => openSheet()}>
              {t("add")}
            </AccentLink>
          }
        />
        <Box pt={8} pb={4} ml={-8}>
          <MonthPicker value={month} onChange={setMonth} />
        </Box>

        {items.length === 0 ? (
          <EmptyText message={t("empty")} action={{ label: t("add"), onClick: () => openSheet() }} />
        ) : (
          <Box style={{ opacity: stale ? 0.5 : 1 }}>
            <SectionBoundary loading={<SectionSkeleton hero />} resetKey={shownMonth}>
              <FixedMonthHero month={shownMonth} items={items} />
            </SectionBoundary>
            <FixedMonthList month={shownMonth} items={items} onClickRow={openSheet} />
          </Box>
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
        <Box visibleFrom="lg" pt={48} style={{ opacity: stale ? 0.5 : 1 }}>
          <SectionBoundary title={monthLabel(shownMonth)} loading={<SectionSkeleton rows={3} />} resetKey={shownMonth}>
            <FixedMonthRail month={shownMonth} items={items} />
          </SectionBoundary>
        </Box>
      )}
    </div>
  );
}

/** 월 요약 집계 — 사용 합계 · 기록/미기록(보관 제외 활성 항목 중 사용액 유무) */
function summarize(usages: Record<string, number>, items: FixedListItemType[]) {
  const active = items.filter((it) => !it.isArchived);
  // 사용 합계는 usages 전부(지운 항목의 이번 달 사용액도 포함 — 백엔드 합계와 같게)
  const used = Object.values(usages).reduce((sum, v) => sum + v, 0);
  const unrecorded = active.filter((it) => !usages[it.fixedId]).length;
  return { used, recorded: active.length - unrecorded, unrecorded };
}

function useFixedMonth(month: string, items: FixedListItemType[]) {
  const { data } = useSuspenseQuery(queryKeys.fixed.monthlySummary(month));
  return summarize(data.body.data.usages, items);
}

function FixedMonthHero({ month, items }: { month: string; items: FixedListItemType[] }) {
  const t = useTranslations("fixed");
  const monthLabel = useMonthLabel();
  const { used, recorded, unrecorded } = useFixedMonth(month, items);

  return (
    <HeroAmount compact label={t("month_total", { month: monthLabel(month) })} amount={used}>
      {/* 데스크톱은 레일이 기록·미기록을 말한다 */}
      <Text hiddenFrom="lg" c="dimmed" style={{ fontSize: 13, lineHeight: "19px" }}>
        {t("summary_caption", { recorded, count: unrecorded })}
      </Text>
    </HeroAmount>
  );
}

/**
 * 목록 — 사용액은 hero 와 같은 캐시를 비-Suspense 로 읽는다(요약이 없으면 금액만 비고 행·수정 진입은 그대로).
 * 보관 항목은 맨 아래 "보관 N" 섹션(제목 dim) — 거래 기록 선택지에선 빠졌지만 지난 기록·수정은 남는다 (배치5).
 */
function FixedMonthList({
  month,
  items,
  onClickRow,
}: {
  month: string;
  items: FixedListItemType[];
  onClickRow: (fixedId: string) => void;
}) {
  const t = useTranslations("fixed");
  const { data } = useQuery({ ...queryKeys.fixed.monthlySummary(month), placeholderData: keepPreviousData });
  const usages = data?.body.data.usages;

  const active = items.filter((it) => !it.isArchived);
  const archived = items.filter((it) => it.isArchived);
  const groups = [
    { key: "active", label: t("list_title"), rows: active },
    { key: "archived", label: t("archived_title"), rows: archived },
  ].filter((g) => g.rows.length > 0);

  return (
    <>
      {groups.map((g) => (
        <Section
          key={g.key}
          title={
            <>
              {g.label}{" "}
              <Text component="span" inherit c="dimmed" className="moeum-mono" fw={600}>
                {g.rows.length}
              </Text>
            </>
          }
        >
          {g.rows.map((it, i) => {
            const value = usages?.[it.fixedId] ?? 0;
            // 보관 행은 이번 달 사용액이 있을 때만 금액(없으면 0 을 늘어놓지 않는다)
            const showValue = usages && (!it.isArchived || value > 0);
            return (
              <ListRow
                key={it.fixedId}
                tall
                title={it.isArchived ? <Text component="span" inherit c="dimmed">{it.name}</Text> : it.name}
                lead={{ icon: isKnownIcon(it.icon) ? it.icon : it.categoryIcon, color: it.color ?? it.categoryColor }}
                meta={[t("day_format", { day: it.dayOfMonth }), it.categoryName].filter(Boolean).join(" · ")}
                value={showValue ? fmt(value) : undefined}
                valueColor={amountColor(value, "text")}
                chevron
                last={i === g.rows.length - 1}
                onClick={() => onClickRow(it.fixedId)}
              />
            );
          })}
        </Section>
      ))}
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
      <ListRow title={t("unrecorded")} value={t("count_unit", { count: unrecorded })} valueColor={amountColor(unrecorded, "text")} last />
    </Section>
  );
}
