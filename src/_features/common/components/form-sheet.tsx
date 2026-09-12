"use client";

import { Box, Drawer, Group, Text } from "@mantine/core";
import { Suspense } from "react";

import { PageLoader } from "_features/common/components/page-loader";

interface FormSheetProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  /** 제목 우측 액션(아이콘 버튼 등). 하단 버튼을 늘리지 않고 보조 액션을 둘 자리. */
  titleAction?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 공용 폼 시트 — 추가/수정 폼을 담는 단일 패턴 (DESIGN.md §5 시트·모달, Figma 46:451).
 *
 * 모바일 = 바텀시트 448 · 상단 라운드 16 · 핸들 40×4 hair · surface.
 * 데스크톱(≥1200) = 같은 Drawer 를 CSS 로 가운데 모달 560 · 라운드 12 로 바꾼다
 * (`.moeum-sheet-*`, globals.css) — useMediaQuery 분기 없이 SSR 첫 렌더와 일치.
 * 닫히면 children unmount 라 다음 진입 시 폼이 fresh. 내부 Suspense 로 폼의
 * useSuspenseQuery 캐시 miss 가 페이지 전체로 throw 되어 깜박이는 걸 막는다.
 *
 * Drawer zIndex 는 Mantine 기본(200) — 내부 Select/DateInput dropdown(300)이
 * 자연스럽게 위에 뜨도록 명시하지 않는다.
 */
export default function FormSheet({
  opened,
  onClose,
  title,
  titleAction,
  children,
}: FormSheetProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="auto"
      withCloseButton={false}
      classNames={{ inner: "moeum-sheet-inner", content: "moeum-sheet-content" }}
      styles={{
        content: {
          // BottomTab(z-index 500, 64px) 이 시트 위로 떠서 하단 버튼을 가로채는 걸 방지 —
          // BottomTab 높이까지 빼고 본문에 채워 끝 버튼을 띄운다(데스크톱은 탭바 0).
          maxHeight:
            "min(90dvh, calc(100dvh - var(--bottom-tab-h) - var(--safe-bottom)))",
        },
        body: {
          paddingBottom:
            "calc(var(--bottom-tab-h) + var(--safe-bottom) + 16px)",
        },
      }}
    >
      {/* 핸들 40×4 hair — 데스크톱 모달에선 숨김 */}
      <Group justify="center" pt={4} pb={8} className="moeum-sheet-handle">
        <Box w={40} h={4} style={{ borderRadius: 2, background: "var(--moeum-hair)" }} />
      </Group>

      <Group justify="space-between" align="center" wrap="nowrap" px="xs" pb="xs">
        <Text fw={800} c="var(--moeum-text)" style={{ fontSize: 16, lineHeight: "24px", letterSpacing: "-0.03em" }}>
          {title}
        </Text>
        {titleAction}
      </Group>

      {opened && <Suspense fallback={<PageLoader />}>{children}</Suspense>}
    </Drawer>
  );
}
