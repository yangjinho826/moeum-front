"use client";

import { ActionIcon, Group, Title } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface SubHeaderProps {
  /** 페이지 제목 */
  title: string;
  /** true=router.back() 기본, string=router.push(href) */
  back?: true | string;
  /** 우측 액션 슬롯 (텍스트 링크 · ActionIcon) */
  right?: ReactNode;
}

/**
 * SubHeader — 풀페이지 sub-route 의 표준 상단 (Figma 41:365 Header).
 * 48px 행: ‹ 뒤로(20, 히트 36) + 제목 22/800 -0.03em(PageTitle 과 같은 크기) + 우측 슬롯.
 *
 * 사용:
 *   <SubHeader title="거래 추가" />
 *   <SubHeader title="멤버 관리" back="/settings" />
 *   <SubHeader title={name} right={<UnstyledButton onClick={edit}>수정</UnstyledButton>} />
 */
export default function SubHeader({ title, back = true, right }: SubHeaderProps) {
  const router = useRouter();
  const tg = useTranslations("general.common");

  const onBack = () => {
    if (typeof back === "string") router.push(back);
    else router.back();
  };

  return (
    <Group justify="space-between" align="center" wrap="nowrap" h={48} gap="sm">
      <Group gap={0} align="center" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
        {/* 아이콘 20 · 히트 44(DESIGN 터치 44) — 좌측 음수 마진으로 아이콘 선이 본문 좌측선(20)에 맞게, 제목 위치는 그대로 */}
        <ActionIcon variant="subtle" color="gray" size={44} onClick={onBack} aria-label={tg("back")} ml={-12}>
          <IconChevronLeft size={20} stroke={2} color="var(--moeum-text)" />
        </ActionIcon>
        <Title
          order={2}
          style={{
            fontSize: 22,
            lineHeight: "30px",
            letterSpacing: "-0.03em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {title}
        </Title>
      </Group>
      {right}
    </Group>
  );
}
