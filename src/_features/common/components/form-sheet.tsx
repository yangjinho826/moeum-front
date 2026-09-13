"use client";

import { ActionIcon, Box, Drawer, Group } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { type ReactNode, Suspense } from "react";

import { PageLoader } from "_features/common/components/page-loader";

interface FormSheetProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  /** 제목 우측 액션(아이콘 버튼 등). 하단 버튼을 늘리지 않고 보조 액션을 둘 자리. */
  titleAction?: ReactNode;
  /** 폼이 아닌 시트(전환기·멤버) — 취소 버튼이 없어 제목 옆 닫기(X, 히트 44)를 둔다 */
  withClose?: boolean;
  /** 내용 로딩 자리 — 기본 PageLoader(70dvh)는 짧은 시트를 크게 열었다 줄이므로 행 모양 스켈레톤을 넘긴다 */
  fallback?: ReactNode;
  children: ReactNode;
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
 * 자연스럽게 위에 뜨도록 명시하지 않는다. BottomTab(190)은 그 아래라 시트가 탭바를 덮으므로
 * 탭바 높이 보정은 없고 홈 인디케이터(--safe-bottom)만 띄운다.
 */
export default function FormSheet({
  opened,
  onClose,
  title,
  titleAction,
  withClose = false,
  fallback,
  children,
}: FormSheetProps) {
  const tg = useTranslations("general.common");
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="auto"
      withCloseButton={false}
      // 본문 좌우 20 = 모바일 콘텐츠 여백과 같게(Figma 시트 46:451 패딩 20, DESIGN §4). Mantine 기본 md 는 12
      padding={20}
      classNames={{ inner: "moeum-sheet-inner", content: "moeum-sheet-content" }}
      styles={{
        // size="auto" 여도 Mantine --drawer-height 가 최대 높이로 풀려 푸터 아래 빈칸 → 내용 높이로(Figma 46:451)
        content: { maxHeight: "90dvh", height: "auto" },
        // 위는 12 그대로(핸들이 윗변에 붙게), 좌우만 padding 20
        body: { paddingTop: 12, paddingBottom: "calc(var(--safe-bottom) + 16px)" },
      }}
    >
      {/* 핸들 40×4 hair — 데스크톱 모달에선 숨김 */}
      <Group justify="center" pt={4} pb={8} className="moeum-sheet-handle">
        <Box w={40} h={4} style={{ borderRadius: 2, background: "var(--moeum-hair)" }} />
      </Group>

      <Group justify="space-between" align="center" wrap="nowrap" pb="xs">
        {/* Drawer.Title = h2 + 다이얼로그 aria-labelledby 자동 연결(스크린리더가 시트 이름을 읽음) */}
        <Drawer.Title fw={800} c="var(--moeum-text)" style={{ fontSize: 16, lineHeight: "24px", letterSpacing: "-0.03em" }}>
          {title}
        </Drawer.Title>
        {titleAction}
        {withClose && (
          // 아이콘 18 · 히트 44 — 오른쪽 음수 마진으로 아이콘 선이 본문 우측선(20)에 맞게
          <ActionIcon variant="subtle" color="gray" size={44} mr={-13} my={-10} onClick={onClose} aria-label={tg("close")}>
            <IconX size={18} stroke={2} color="var(--moeum-text-dim)" />
          </ActionIcon>
        )}
      </Group>

      {opened && <Suspense fallback={fallback ?? <PageLoader />}>{children}</Suspense>}
    </Drawer>
  );
}
