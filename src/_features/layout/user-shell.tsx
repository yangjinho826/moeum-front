"use client";

import { Stack } from "@mantine/core";
import type { ReactNode } from "react";

import AccountSheet from "_features/account/components/account-sheet";
import HouseholdSheet from "_features/household/components/household-sheet";
import MembersSheet from "_features/household/components/members-sheet";
import AppHeader from "_features/layout/components/app-header";
import { BottomTab } from "_features/layout/components/bottom-tab";
import RecordFab from "_features/layout/components/record-fab";
import { SidebarNav } from "_features/layout/components/sidebar-nav";
import PortfolioSheet from "_features/portfolio/components/portfolio-sheet";
import QuickAddSheet from "_features/transaction/components/quick-add-sheet";

/**
 * UserShell — 반응형 셸 (3 viewport). DESIGN.md §4·§5.
 *
 * - 휴대폰(<sm=768): block, max-width 448, AppHeader 48 sticky + BottomTab 64 fixed + RecordFab(홈·거래)
 * - 패드(sm~lg=768~1199): block, max-width 768, 위와 동일
 * - 데스크탑(>=lg=1200): flex (좌 SidebarNav 220 + 우 메인), AppHeader/BottomTab/RecordFab 숨김
 *
 * 좌우 여백은 `--content-px`(20 / 40), max-width 는 BaseLayout main 의 `--container-max`.
 * display 분기는 `.user-shell-wrap` utility class (globals.css) 로 CSS only — SSR 안전.
 */
export function UserShell({ children }: { children: ReactNode }) {
  return (
    <div className="user-shell-wrap">
      <SidebarNav />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          paddingLeft: "var(--content-px)",
          paddingRight: "var(--content-px)",
          paddingTop: "var(--mantine-spacing-lg)",
          paddingBottom:
            // 탭바 + RecordFab(40 + 14) 이 마지막 행을 가리지 않게 4xl(64)
            "calc(var(--bottom-tab-h) + var(--safe-bottom) + var(--mantine-spacing-4xl))",
        }}
      >
        <AppHeader />
        <Stack gap="md">{children}</Stack>
        <BottomTab />
        <RecordFab />
      </div>

      <QuickAddSheet />
      <AccountSheet />
      <HouseholdSheet />
      <PortfolioSheet />
      <MembersSheet />
    </div>
  );
}
