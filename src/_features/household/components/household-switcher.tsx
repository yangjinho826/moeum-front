"use client";

import { Group } from "@mantine/core";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { queryKeys } from "_constants/queries";
import AccentLink from "_features/common/components/accent-link";
import FormSheet from "_features/common/components/form-sheet";
import SectionSkeleton from "_features/common/components/section-skeleton";
import Hairline from "_features/common/components/hairline";
import ListRow from "_features/common/components/list-row";

import { useHouseholdSheetStore, useHouseholdStore } from "../store";

interface HouseholdSwitcherProps {
  opened: boolean;
  onClose: () => void;
}

/**
 * 가계부 전환기 (셸, plan/6.md · Figma 76:141) — 헤더 pill · 사이드바 · 내정보에서 연다.
 * 행은 가계부 목록(73:517)과 같은 ListRow: 이름 / 역할 · 시작일, 지금 쓰는 가계부 = "사용 중".
 * 아래 "새 가계부 만들기"(가계부 시트) · "가계부 관리"(목록 화면).
 */
export function HouseholdSwitcher({ opened, onClose }: HouseholdSwitcherProps) {
  const t = useTranslations("household");
  return (
    <FormSheet
      opened={opened}
      onClose={onClose}
      title={t("switcher_title")}
      withClose
      fallback={<SectionSkeleton rows={2} />}
    >
      <SwitcherBody onClose={onClose} />
    </FormSheet>
  );
}

function SwitcherBody({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("household");
  const tSettings = useTranslations("settings");

  const { data } = useSuspenseQuery(queryKeys.household.list());
  const items = data.body.data.items;

  const currentId = useHouseholdStore((s) => s.currentHouseholdId);
  const setCurrentId = useHouseholdStore((s) => s.setCurrentHouseholdId);
  const openSheet = useHouseholdSheetStore((s) => s.open);
  // 저장된 선택이 없으면 첫 가계부를 쓴다(가계부 목록 · 내정보와 같은 규칙)
  const inUseId = items.some((h) => h.householdId === currentId) ? currentId : items[0]?.householdId;

  const onSelect = (id: string) => {
    // "사용 중" 표시와 같은 기준 — 저장값이 비었을 때 첫 가계부를 눌러도 캐시를 비우지 않게
    if (id === inUseId) {
      onClose();
      return;
    }
    setCurrentId(id);
    onClose();
    // 가계부 = 데이터 컨텍스트 완전 교체(쿼리 키에 가계부가 없음). 전부 초기 상태로 되돌리고
    // 화면에 떠 있는 쿼리는 새 X-Household-Id 헤더로 바로 다시 불러온다.
    // clear() 는 캐시에서 떼기만 해서 떠 있는 화면이 옛 데이터를 들고 있고,
    // invalidate 는 staleTime:Infinity(enum 등) 캐시를 남긴다.
    queryClient.resetQueries();
  };

  return (
    <>
      {items.map((h, i) => (
        <ListRow
          key={h.householdId}
          tall
          title={h.name}
          meta={t("row_meta", {
            role: h.role === "OWNER" ? t("member.role_owner") : t("member.role_member"),
            date: h.startedAt.replaceAll("-", "."),
          })}
          value={h.householdId === inUseId ? t("in_use") : undefined}
          current={h.householdId === inUseId}
          valueColor="dim"
          valueText
          last={i === items.length - 1}
          onClick={() => onSelect(h.householdId)}
        />
      ))}
      <Hairline />
      <Group justify="space-between" wrap="nowrap">
        {/* AccentLink 는 왼쪽 패딩 12 로 히트를 넓힌다 — 첫 링크는 본문 좌측선에 맞게 상쇄 */}
        <div style={{ marginLeft: -12 }}>
          <AccentLink
            variant="header"
            onClick={() => {
              onClose();
              openSheet();
            }}
          >
            {t("create_new")}
          </AccentLink>
        </div>
        <AccentLink
          variant="header"
          onClick={() => {
            onClose();
            router.push(`/${locale}/household`);
          }}
        >
          {tSettings("household_manage")}
        </AccentLink>
      </Group>
    </>
  );
}
