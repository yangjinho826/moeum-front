"use client";

import { Box, UnstyledButton } from "@mantine/core";
import {
  IconChartPie,
  IconTrendingUp,
  IconUser,
  IconWallet,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

export interface Tab {
  id: string;
  icon: typeof IconChartPie;
  href: string;
  match: (pathname: string) => boolean;
}

// 자산중심 4탭. label 은 nav i18n 키(id) 로 해석.
export const TABS: Tab[] = [
  {
    id: "home",
    icon: IconChartPie,
    href: "/",
    match: (p) => p === "/" || /^\/[a-z]{2}\/?$/.test(p),
  },
  {
    id: "transactions",
    icon: IconWallet,
    href: "/transactions",
    match: (p) => p.includes("/transactions"),
  },
  {
    id: "invest",
    icon: IconTrendingUp,
    href: "/invest",
    match: (p) => p.includes("/invest"),
  },
  {
    id: "settings",
    icon: IconUser,
    href: "/settings",
    match: (p) => p.includes("/settings"),
  },
];

/**
 * BottomTab — 모바일 탭바 64 (DESIGN.md §5 셸, Figma TabBar 20:80).
 * 배경 bg · 상단 hair · 활성 accent / 비활성 dimmed. 아이콘 20 + 라벨 11/700.
 */
export function BottomTab() {
  const pathname = usePathname();
  const params = useParams<{ locale: string }>();
  const t = useTranslations("nav");

  return (
    <Box
      component="nav"
      hiddenFrom="lg"
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "var(--container-max)",
        background: "var(--moeum-bg)",
        borderTop: "1px solid var(--moeum-hair)",
        // iOS 홈 인디케이터 / Android 제스처 영역 보호
        paddingBottom: "var(--safe-bottom)",
        paddingLeft: "var(--safe-left)",
        paddingRight: "var(--safe-right)",
        // Drawer/Modal 기본 z-index(200대) 위 — 바텀시트 떠도 메뉴 항상 사용 가능
        zIndex: "var(--z-bottom-tab)" as React.CSSProperties["zIndex"],
      }}
    >
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          height: "var(--bottom-tab-h)",
        }}
      >
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
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                height: "100%",
                transition: "color 150ms ease-out",
              }}
            >
              <Icon size={20} color={color} stroke={active ? 2.5 : 2} />
              <Box
                component="span"
                style={{ fontSize: 11, lineHeight: "16px", fontWeight: 700, color }}
              >
                {t(id)}
              </Box>
            </UnstyledButton>
          );
        })}
      </Box>
    </Box>
  );
}
