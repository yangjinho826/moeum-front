"use client";

import { Box, Stack, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useState } from "react";

import CategoryForm from "_features/category/components/form";
import { useCategorySearch } from "_features/category/hooks/use-sub/use-search";
import type { CategoryListItemType } from "_features/category/types";
import AccentLink from "_features/common/components/accent-link";
import EmptyText from "_features/common/components/empty-text";
import FormSheet from "_features/common/components/form-sheet";
import ListRow from "_features/common/components/list-row";
import Section from "_features/common/components/section";
import SubHeader from "_features/layout/components/sub-header";
import { InfiniteSentinel } from "_libraries/query/infinite-sentinel";

/**
 * 카테고리 관리 (plan/4.md, Figma 67:1013) — 지출 · 수입 두 섹션, 행 앞 18px 아이콘(사용자가 고른 아이콘·색).
 * 필터 칩 없이 한 화면에 전부. 행 탭 = 수정 시트, 헤더 "추가" = 추가 시트.
 */
export default function CategorySection() {
  const t = useTranslations("category");
  const tKind = useTranslations("enum.category-kind");
  const tg = useTranslations("general.common");

  const [opened, setOpened] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const openSheet = (id?: string) => {
    setEditId(id);
    setOpened(true);
  };

  const { items, expense, income, hasNextPage, fetchNextPage, isFetchingNextPage } = useCategorySearch();
  const groups = [
    { kind: "EXPENSE" as const, rows: expense },
    { kind: "INCOME" as const, rows: income },
  ].filter((g) => g.rows.length > 0);

  const renderRows = (rows: CategoryListItemType[]) =>
    rows.map((it, i) => (
      <ListRow
        key={it.categoryId}
        title={it.name}
        lead={{ icon: it.icon, color: it.color }}
        chevron
        last={i === rows.length - 1}
        onClick={() => openSheet(it.categoryId)}
      />
    ));

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

        {items.length === 0 ? (
          <EmptyText message={t("empty")} action={{ label: t("add"), onClick: () => openSheet() }} />
        ) : (
          groups.map((g, i) => (
            <Section
              key={g.kind}
              hairline={i > 0}
              title={
                <>
                  {tKind(g.kind)}{" "}
                  <Text component="span" inherit c="dimmed" className="moeum-mono" fw={600}>
                    {g.rows.length}
                  </Text>
                </>
              }
            >
              {renderRows(g.rows)}
            </Section>
          ))
        )}

        <InfiniteSentinel hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={fetchNextPage} />

        <FormSheet
          opened={opened}
          onClose={() => setOpened(false)}
          title={editId ? t("form_update_title") : t("form_create_title")}
        >
          <CategoryForm categoryId={editId} onDone={() => setOpened(false)} inSheet />
        </FormSheet>
      </Stack>

      {/* 데스크톱 레일 — 삭제 규칙을 미리 알려 둔다(개수는 섹션 제목이 말함) */}
      <Box visibleFrom="lg" pt={48}>
        <Section title={tg("guide")}>
          <Text c="dimmed" pt={8} style={{ fontSize: 12, lineHeight: 1.6 }}>
            {t("guide.delete_body")}
          </Text>
        </Section>
      </Box>
    </div>
  );
}
