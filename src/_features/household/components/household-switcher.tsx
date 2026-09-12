"use client";

import {
  Drawer,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconCheck, IconCrown, IconPlus, IconUsers } from "@tabler/icons-react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { queryKeys } from "_constants/queries";

import { useHouseholdStore, useHouseholdSheetStore } from "../store";

interface HouseholdSwitcherProps {
  opened: boolean;
  onClose: () => void;
}

export function HouseholdSwitcher({ opened, onClose }: HouseholdSwitcherProps) {
  const queryClient = useQueryClient();
  const t = useTranslations("household");

  const { data: hData } = useSuspenseQuery(queryKeys.household.list());
  const households = hData.body.data.items;

  const currentId = useHouseholdStore((s) => s.currentHouseholdId);
  const setCurrentId = useHouseholdStore((s) => s.setCurrentHouseholdId);
  const openSheet = useHouseholdSheetStore((s) => s.open);

  const onSelect = (id: string) => {
    if (id === currentId) {
      onClose();
      return;
    }
    setCurrentId(id);
    onClose();
    // 가계부 = 데이터 컨텍스트 완전 교체. invalidate 는 활성 쿼리만 refetch 하고
    // enum 등 staleTime:Infinity 캐시는 그대로 남아 옛 가계부 데이터가 보인다.
    // → 캐시 전체 제거 후 마운트된 쿼리부터 새 X-Household-Id 헤더로 재요청.
    queryClient.clear();
  };

  const onCreateNew = () => {
    onClose();
    openSheet();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="auto"
      withCloseButton={false}
      styles={{
        content: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxWidth: 448,
          margin: "0 auto",
          // 시트가 BottomTab(190) 위라 탭바 보정 없이 홈 인디케이터만 띄움
          maxHeight: "80dvh",
        },
        body: {
          paddingBottom: "calc(var(--safe-bottom) + 8px)",
        },
      }}
    >
      {/* 핸들바 */}
      <Group justify="center" pt={4} pb={8}>
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: "var(--mantine-color-gray-3)",
          }}
        />
      </Group>

      <Stack gap={4} px="md" pb="xs">
        <Text size="md" fw={800}>
          {t("switcher_title")}
        </Text>
        <Text size="xs" fw={500} c="dimmed">
          {t("switcher_count", { count: households.length })}
        </Text>
      </Stack>

      <Stack gap={0} px="xs" pb="xs" mah={400} style={{ overflowY: "auto" }}>
        {households.map((h) => {
          const isOwner = h.role === "OWNER";
          const isSelected = h.householdId === currentId;
          return (
            <UnstyledButton
              key={h.householdId}
              onClick={() => onSelect(h.householdId)}
              style={{ padding: 12, borderRadius: 16 }}
            >
              <Group gap={12} wrap="nowrap">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: isOwner
                      ? "var(--mantine-color-sage-0)"
                      : "var(--mantine-color-terracotta-0)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <IconUsers
                    size={20}
                    color={
                      isOwner
                        ? "var(--mantine-color-sage-6)"
                        : "var(--mantine-color-terracotta-6)"
                    }
                  />
                </div>
                <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                  <Group gap={6} wrap="nowrap">
                    <Text size="sm" fw={700} truncate>
                      {h.name}
                    </Text>
                    {isOwner && (
                      <IconCrown
                        size={12}
                        color="var(--mantine-color-warning-5)"
                        fill="var(--mantine-color-warning-5)"
                        style={{ flexShrink: 0 }}
                      />
                    )}
                  </Group>
                  <Text size="xs" fw={500} c="dimmed">
                    {isOwner
                      ? t("member.role_owner")
                      : t("member.role_member")}
                    {typeof h.memberCount === "number"
                      ? ` · ${t("member_count", { count: h.memberCount })}`
                      : ""}
                  </Text>
                </Stack>
                {isSelected && (
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      background: "var(--mantine-color-sage-6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconCheck size={14} color="white" stroke={3} />
                  </div>
                )}
              </Group>
            </UnstyledButton>
          );
        })}
      </Stack>

      {/* 새 모음 만들기 */}
      <div
        style={{
          borderTop: "1px solid var(--mantine-color-gray-2)",
          padding: "8px",
        }}
      >
        <UnstyledButton
          onClick={onCreateNew}
          style={{ padding: 12, borderRadius: 16, width: "100%" }}
        >
          <Group gap={12}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "var(--mantine-color-gray-1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconPlus size={20} color="var(--mantine-color-gray-6)" />
            </div>
            <Text size="sm" fw={700}>
              {t("create_new")}
            </Text>
          </Group>
        </UnstyledButton>
      </div>
    </Drawer>
  );
}
