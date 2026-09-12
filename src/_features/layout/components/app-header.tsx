"use client";

import { Group, Text, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { queryKeys } from "_constants/queries";
import { HouseholdSwitcher } from "_features/household/components/household-switcher";
import { useHouseholdStore } from "_features/household/store";

/**
 * AppHeader — 모바일 상단 48 (DESIGN.md §5 셸, Figma Header 12:3).
 * 좌: 브랜드 "모음" accent 15/800 · 우: 가계부 pill(이름 + chevron, 2개↑면 개수).
 * 설정 아이콘 없음(탭 "내정보"가 담당). 배경 bg, 테두리 없음.
 */
export default function AppHeader() {
  const currentId = useHouseholdStore((s) => s.currentHouseholdId);
  const [opened, switcher] = useDisclosure(false);
  const t = useTranslations("household");
  const ta = useTranslations("auth");

  const { data: hData } = useSuspenseQuery(queryKeys.household.list());
  const households = hData.body.data.items;
  const currentHousehold =
    households.find((h) => h.householdId === currentId) ?? households[0];

  return (
    <>
      <Group
        component="header"
        justify="space-between"
        align="center"
        wrap="nowrap"
        hiddenFrom="lg"
        style={{
          position: "sticky",
          top: 0,
          zIndex: "var(--z-app-header)" as React.CSSProperties["zIndex"],
          background: "var(--moeum-bg)",
          // 노치/상태바 영역 흡수 — paddingTop 으로 콘텐츠가 노치 아래로 내려옴
          paddingTop: "var(--safe-top)",
          minHeight: "calc(var(--app-header-h) + var(--safe-top))",
          paddingLeft: "var(--content-px)",
          paddingRight: "var(--content-px)",
          marginLeft: "calc(var(--content-px) * -1)",
          marginRight: "calc(var(--content-px) * -1)",
          marginTop: "calc(var(--mantine-spacing-lg) * -1)",
        }}
      >
        <Text
          className="brand-wordmark"
          style={{ fontSize: 15, lineHeight: "20px" }}
        >
          {ta("brand_name")}
        </Text>

        <UnstyledButton
          onClick={switcher.open}
          aria-label={t("list_title")}
          style={{
            height: 32,
            padding: "0 10px",
            borderRadius: "var(--mantine-radius-md)",
            border: "1px solid var(--moeum-hair)",
            display: "flex",
            alignItems: "center",
            gap: 4,
            maxWidth: "60%",
          }}
        >
          <Text
            fw={700}
            c="var(--moeum-text)"
            truncate
            style={{ fontSize: 12, lineHeight: "19px", letterSpacing: "-0.01em" }}
          >
            {currentHousehold?.name ?? t("list_title")}
          </Text>
          {households.length > 1 && (
            <Text
              className="moeum-mono"
              fw={600}
              c="dimmed"
              style={{ fontSize: 11, lineHeight: "16px" }}
            >
              {households.length}
            </Text>
          )}
          <IconChevronDown size={12} stroke={2} color="var(--moeum-text-dim)" />
        </UnstyledButton>
      </Group>

      <HouseholdSwitcher opened={opened} onClose={switcher.close} />
    </>
  );
}
