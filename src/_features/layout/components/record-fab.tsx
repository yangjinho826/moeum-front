"use client";

import { Box, UnstyledButton } from "@mantine/core";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { useQuickAddStore } from "_features/transaction/store";

import { isHomeRoot, TABS } from "./bottom-tab";

/**
 * `＋ 기록` — 모바일 탭바 위 우측 40px accent 버튼 (DESIGN.md §5 셸, Figma FAB 20:98).
 * 홈·거래 탭에서만. 셸이 소유해 어느 화면도 "추가" 버튼을 따로 두지 않는다.
 * 40px 은 Button sm(36)/md(44) 사이라 UnstyledButton 으로 그린다.
 */
export default function RecordFab() {
  const pathname = usePathname();
  const open = useQuickAddStore((s) => s.open);
  const t = useTranslations("nav");

  // 홈은 루트만 — 홈 탭 활성이 /wealth·/account 까지 넓어졌어도 FAB 는 거기 안 띄운다 (배치3 S6)
  const visible =
    isHomeRoot(pathname) ||
    TABS.some((tab) => tab.id === "transactions" && tab.match(pathname));
  if (!visible) return null;

  return (
    <Box
      hiddenFrom="lg"
      style={{
        position: "fixed",
        // 컨테이너(--container-max) 안쪽 우측 16 — 패드에서도 박스 기준 정렬
        right: "max(16px, calc((100vw - var(--container-max)) / 2 + 16px))",
        bottom: "calc(var(--bottom-tab-h) + var(--safe-bottom) + 14px)",
        zIndex: "var(--z-fab)" as React.CSSProperties["zIndex"],
      }}
    >
      <UnstyledButton
        onClick={() => open()}
        aria-label={t("record_full")}
        className="moeum-fab"
        style={{
          position: "relative",
          height: 40,
          padding: "0 var(--mantine-spacing-lg)",
          borderRadius: "var(--mantine-radius-md)",
          background: "var(--moeum-accent)",
          color: "var(--moeum-on-accent)",
          fontSize: 13,
          fontWeight: 700,
          lineHeight: "20px",
          letterSpacing: "-0.01em",
          display: "flex",
          alignItems: "center",
          whiteSpace: "nowrap",
        }}
      >
        ＋ {t("record")}
      </UnstyledButton>
    </Box>
  );
}
