"use client";

import { Box, Button, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { queryKeys } from "_constants/queries";
import BrandLogo from "_features/auth/components/brand-logo";
import { HouseholdSwitcher } from "_features/household/components/household-switcher";
import { useHouseholdStore } from "_features/household/store";
import { useQuickAddStore } from "_features/transaction/store";

import { TABS } from "./bottom-tab";

/**
 * SidebarNav — 데스크탑(>=lg=1200) 전용 좌측 세로 nav 220 (DESIGN.md §5 셸).
 *
 * 브랜드 → 가계부 스위처 → 4탭(활성 = accent-soft 배경 + accent 텍스트) → 하단 "기록하기" 44.
 * 휴대폰/패드(<lg) 에선 display: none — AppHeader + BottomTab + RecordFab 이 같은 역할.
 */
export function SidebarNav() {
  const pathname = usePathname();
  const params = useParams<{ locale: string }>();
  const [opened, switcher] = useDisclosure(false);
  const t = useTranslations("nav");
  const th = useTranslations("household");
  const ta = useTranslations("auth");
  const openQuickAdd = useQuickAddStore((s) => s.open);

  const currentId = useHouseholdStore((s) => s.currentHouseholdId);
  const { data: hData } = useSuspenseQuery(queryKeys.household.list());
  const households = hData.body.data.items;
  const currentHousehold =
    households.find((h) => h.householdId === currentId) ?? households[0];

  return (
    <>
      <Box
        component="aside"
        visibleFrom="lg"
        style={{
          width: "var(--sidebar-w)",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          alignSelf: "flex-start",
          height: "100dvh",
          borderRight: "1px solid var(--moeum-hair)",
          padding: "var(--mantine-spacing-lg) var(--mantine-spacing-md)",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          background: "var(--moeum-bg)",
        }}
      >
        {/* 앱 브랜드 마크 */}
        <Group gap={8} px={8} pt={2} pb={20} wrap="nowrap">
          <BrandLogo size={28} />
          <Text className="brand-wordmark" style={{ fontSize: 18, lineHeight: "24px" }}>
            {ta("brand_name")}
          </Text>
        </Group>

        {/* 가계부 스위처 trigger */}
        <UnstyledButton
          onClick={switcher.open}
          style={{
            padding: "8px 12px",
            borderRadius: "var(--mantine-radius-md)",
            border: "1px solid var(--moeum-hair)",
            marginBottom: 12,
          }}
        >
          <Group gap={6} wrap="nowrap" justify="space-between">
            <Text fw={700} c="var(--moeum-text)" truncate style={{ fontSize: 13 }}>
              {currentHousehold?.name ?? th("list_title")}
            </Text>
            <Group gap={4} wrap="nowrap">
              {households.length > 1 && (
                <Text className="moeum-mono" fw={600} c="dimmed" style={{ fontSize: 11 }}>
                  {households.length}
                </Text>
              )}
              <IconChevronDown size={12} stroke={2} color="var(--moeum-text-dim)" />
            </Group>
          </Group>
        </UnstyledButton>

        {/* 4개 탭 */}
        <Stack gap={2}>
          {TABS.map(({ id, icon: Icon, href, match }) => {
            const active = match(pathname);
            const color = active ? "var(--moeum-accent)" : "var(--moeum-text-dim)";
            return (
              <UnstyledButton
                key={id}
                component={Link}
                href={`/${params.locale}${href === "/" ? "" : href}`}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--mantine-radius-md)",
                  background: active ? "var(--moeum-accent-soft)" : "transparent",
                  transition: "background 150ms ease-out, color 150ms ease-out",
                }}
              >
                <Group gap={12} wrap="nowrap">
                  <Icon size={20} color={color} stroke={active ? 2.5 : 2} />
                  <Text fw={active ? 700 : 600} style={{ fontSize: 14, color }}>
                    {t(id)}
                  </Text>
                </Group>
              </UnstyledButton>
            );
          })}
        </Stack>

        {/* 하단 기록하기 — 모바일 RecordFab 과 같은 store */}
        <Button
          mt="auto"
          fullWidth
          size="md"
          onClick={() => openQuickAdd()}
        >
          ＋ {t("record_full")}
        </Button>
      </Box>

      <HouseholdSwitcher opened={opened} onClose={switcher.close} />
    </>
  );
}
