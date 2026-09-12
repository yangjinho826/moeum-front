"use client";

import { Button, Group, Stack, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import CategoryForm from "_features/category/components/form";
import CategoryTable from "_features/category/components/table";
import { useCategorySearch } from "_features/category/hooks/use-sub/use-search";
import type { CategoryKind } from "_features/category/types";
import FilterChip from "_features/common/components/filter-chip";
import FormSheet from "_features/common/components/form-sheet";
import { useEnumOptions } from "_features/enum/queries/use-query";
import { InfiniteSentinel } from "_libraries/query/infinite-sentinel";

export default function CategorySection() {
  const t = useTranslations("category");
  const tKind = useTranslations("enum.category-kind");
  const tGeneral = useTranslations("general");

  const [opened, setOpened] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const openSheet = (id?: string) => {
    setEditId(id);
    setOpened(true);
  };

  const {
    kind,
    setKind,
    items,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useCategorySearch();

  const { data: kindData } = useEnumOptions("category-kind");
  const kinds = kindData.body.data as CategoryKind[];

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={3}>{t("list_title")}</Title>
        <Button
          size="sm"
          radius="xl"
          leftSection={<IconPlus size={16} />}
          onClick={() => openSheet()}
        >
          {t("add")}
        </Button>
      </Group>

      <Group gap="xs">
        <FilterChip
          label={tGeneral("all")}
          active={kind === undefined}
          onClick={() => setKind(undefined)}
        />
        {kinds.map((k) => (
          <FilterChip
            key={k}
            label={tKind(k)}
            active={kind === k}
            onClick={() => setKind(k)}
          />
        ))}
      </Group>

      <CategoryTable items={items} onClickRow={(id) => openSheet(id)} />

      <InfiniteSentinel
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />

      <FormSheet
        opened={opened}
        onClose={() => setOpened(false)}
        title={editId ? t("form_update_title") : t("form_create_title")}
      >
        <CategoryForm
          categoryId={editId}
          onDone={() => setOpened(false)}
          inSheet
        />
      </FormSheet>
    </Stack>
  );
}
