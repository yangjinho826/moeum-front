"use client";

import {
  Box,
  Button,
  Group,
  SegmentedControl,
  Stack,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import { useAuthContext } from "_features/auth/context";
import Hairline from "_features/common/components/hairline";
import ListRow from "_features/common/components/list-row";
import PageTitle from "_features/common/components/page-title";
import Section from "_features/common/components/section";
import StatGrid from "_features/common/components/stat-grid";
import { HouseholdSwitcher } from "_features/household/components/household-switcher";
import { useHouseholdStore, useMembersSheetStore } from "_features/household/store";
import { queryKeys } from "_constants/queries";

/**
 * 내정보 — 프로필 + 3열 → 가계부 3행 → 화면 모드 세그(신규) → 관리 3행 → 로그아웃 outline
 * (plan/1.md, Figma settings 27:257). 데스크톱은 화면 모드·로그아웃이 우측 레일.
 */
export default function SettingsSection() {
  const { locale } = useParams<{ locale: string }>();
  const { user, actions, state } = useAuthContext();
  const [switcherOpened, switcher] = useDisclosure(false);
  const currentId = useHouseholdStore((s) => s.currentHouseholdId);
  const openMembers = useMembersSheetStore((s) => s.open);
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const t = useTranslations("settings");
  const th = useTranslations("household");

  // 의식적 예외 — "한 페이지=한 endpoint" 원칙의 예외 1건.
  // household.list 는 가계부 전환용 전체 목록이라 settings overview(카운트)와 캐시 수명이 다름.
  const { data: hData } = useSuspenseQuery(queryKeys.household.list());
  const { data: overviewRes } = useSuspenseQuery(queryKeys.settings.overview());

  const households = hData.body.data.items;
  const counts = overviewRes.body.data;
  const currentHousehold = households.find((h) => h.householdId === currentId) ?? households[0];

  const onLogout = async () => {
    try {
      await actions.logout();
    } catch {
      // 백엔드 호출 실패해도 mutationFn finally 에서 clearSession 실행됨 — 무시
    }
    // 풀 리로드 — (guest) layout 의 SSR 가드가 새 쿠키 상태로 평가되도록
    window.location.replace(`/${locale}/login`);
  };

  const appearance = (
    <Section title={t("appearance")}>
      <SegmentedControl
        fullWidth
        value={colorScheme}
        onChange={(v) => setColorScheme(v as "light" | "dark" | "auto")}
        data={[
          { value: "light", label: t("scheme_light") },
          { value: "dark", label: t("scheme_dark") },
          { value: "auto", label: t("scheme_auto") },
        ]}
      />
    </Section>
  );

  const logout = (
    <>
      <Hairline />
      <Button
        variant="outline"
        color="gray"
        fullWidth
        size="md"
        loading={state.isLoggingOut}
        disabled={state.isLoggingOut}
        onClick={onLogout}
        styles={{ root: { borderColor: "var(--moeum-hair)", color: "var(--moeum-text)" } }}
      >
        {t("logout")}
      </Button>
    </>
  );

  return (
    <div className="moeum-main-rail">
      <Stack gap={0}>
        <PageTitle title={t("title")} />

        {/* 프로필 */}
        {user && (
          <Group gap={14} wrap="nowrap" pt={16} pb={4}>
            <Box
              w={44}
              h={44}
              style={{
                borderRadius: "var(--mantine-radius-md)",
                background: "var(--moeum-surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Text fw={700} c="var(--moeum-accent)" style={{ fontSize: 16, lineHeight: "20px" }}>
                {user.name?.[0] ?? "U"}
              </Text>
            </Box>
            <Stack gap={2} style={{ minWidth: 0 }}>
              <Text fw={700} c="var(--moeum-text)" truncate style={{ fontSize: 22, lineHeight: "30px", letterSpacing: "-0.03em" }}>
                {user.name}
              </Text>
              <Text c="dimmed" truncate style={{ fontSize: 13, lineHeight: "19px" }}>
                {user.email}
              </Text>
            </Stack>
          </Group>
        )}
        <StatGrid
          items={[
            { label: t("stat_accounts"), value: counts.accountCount },
            { label: t("stat_transactions"), value: counts.transactionCount },
            { label: t("stat_portfolios"), value: counts.portfolioCount },
          ]}
        />

        {/* 가계부 */}
        <Section title={t("household_section")}>
          <ListRow
            tall
            chevron
            title={currentHousehold?.name ?? "—"}
            meta={`${
              currentHousehold?.role === "OWNER" ? th("member.role_owner") : th("member.role_member")
            } · ${t("total_count", { count: households.length })}`}
            onClick={switcher.open}
          />
          <ListRow title={t("household_manage")} chevron href={`/${locale}/household`} />
          {currentHousehold && (
            <ListRow
              title={t("member_manage")}
              meta={
                currentHousehold.memberCount != null
                  ? t("member_count", { count: currentHousehold.memberCount })
                  : undefined
              }
              chevron
              last
              onClick={() => openMembers(currentHousehold.householdId)}
            />
          )}
        </Section>

        <Box hiddenFrom="lg">{appearance}</Box>

        {/* 관리 */}
        <Section title={t("manage_section")}>
          <ListRow
            title={t("category")}
            value={counts.categoryCount}
            valueColor="dim"
            chevron
            href={`/${locale}/category`}
          />
          <ListRow
            title={t("fixed")}
            value={counts.fixedCount}
            valueColor="dim"
            chevron
            href={`/${locale}/fixed`}
          />
          <ListRow
            title={t("account")}
            value={counts.accountCount}
            valueColor="dim"
            chevron
            last
            href={`/${locale}/wealth`}
          />
        </Section>

        <Box hiddenFrom="lg">{logout}</Box>
      </Stack>

      <Box visibleFrom="lg" pt={48}>
        {appearance}
        {logout}
      </Box>

      <HouseholdSwitcher opened={switcherOpened} onClose={switcher.close} />
    </div>
  );
}
