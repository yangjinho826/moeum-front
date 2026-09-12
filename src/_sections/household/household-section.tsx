"use client";

import { Box, Stack, Text } from "@mantine/core";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import AccentLink from "_features/common/components/accent-link";
import EmptyText from "_features/common/components/empty-text";
import FormGuide from "_features/common/components/form-guide";
import ListRow from "_features/common/components/list-row";
import Section from "_features/common/components/section";
import { useHouseholdList } from "_features/household/queries/use-query";
import { useHouseholdSheetStore, useHouseholdStore } from "_features/household/store";
import SubHeader from "_features/layout/components/sub-header";

/**
 * 가계부 관리 (plan/5.md, Figma 73:517) — "가계부 N" 한 섹션, 행 = 이름 · 역할 · 시작일, 지금 쓰는 가계부 "사용 중".
 * 수정·삭제는 소유자만(백엔드 HOUSEHOLD_NOT_OWNER) → 소유자 행만 chevron + 수정 시트, 멤버 행은 누를 수 없다.
 * 가계부 수가 적어 검색·페이징 없음. 멤버 수는 목록 응답에 없어 표시하지 않는다.
 */
export default function HouseholdSection() {
  const t = useTranslations("household");
  const { locale } = useParams<{ locale: string }>();
  const open = useHouseholdSheetStore((s) => s.open);
  const currentId = useHouseholdStore((s) => s.currentHouseholdId);

  const { data } = useHouseholdList();
  const items = data.body.data.items;
  // 저장된 선택이 없으면 첫 가계부를 쓴다(내정보 화면과 같은 규칙)
  const inUseId = items.some((h) => h.householdId === currentId) ? currentId : items[0]?.householdId;

  return (
    <div className="moeum-main-rail">
      <Stack gap={0}>
        <SubHeader
          title={t("list_title")}
          // 내정보 "관리"의 하위 화면 — 새로고침·직접 진입에서도 뒤로 = 내정보
          back={`/${locale}/settings`}
          right={
            <AccentLink variant="header" onClick={() => open()}>
              {t("add")}
            </AccentLink>
          }
        />

        {items.length === 0 ? (
          <EmptyText message={t("empty")} action={{ label: t("add"), onClick: () => open() }} />
        ) : (
          // 헤더 바로 아래 첫 섹션 — 카테고리 목록처럼 구분선 없이
          <Section
            hairline={false}
            title={
              <>
                {t("list_title")}{" "}
                <Text component="span" inherit c="dimmed" className="moeum-mono" fw={600}>
                  {items.length}
                </Text>
              </>
            }
          >
            {items.map((h, i) => {
              const isOwner = h.role === "OWNER";
              return (
                <ListRow
                  key={h.householdId}
                  tall
                  title={h.name}
                  meta={t("row_meta", {
                    role: isOwner ? t("member.role_owner") : t("member.role_member"),
                    date: h.startedAt.replaceAll("-", "."),
                  })}
                  // 값 자리의 글자 라벨 — 본문 서체 13/500 dim (ListRow valueText)
                  value={h.householdId === inUseId ? t("in_use") : undefined}
                  valueColor="dim"
                  valueText
                  chevron={isOwner}
                  last={i === items.length - 1}
                  onClick={isOwner ? () => open(h.householdId) : undefined}
                />
              );
            })}
          </Section>
        )}
        {/* 멤버 행이 왜 안 눌리는지 — 데스크톱은 레일 도움말이, 모바일은 목록 아래 한 줄이 말한다 */}
        {items.some((h) => h.role !== "OWNER") && (
          <Text hiddenFrom="lg" c="dimmed" mt={12} style={{ fontSize: 13, lineHeight: "19px" }}>
            {t("guide.role_body")}
          </Text>
        )}
      </Stack>

      <Box visibleFrom="lg" pt={48}>
        <FormGuide
          items={[
            { title: t("guide.role_title"), body: t("guide.role_body") },
            { title: t("guide.switch_title"), body: t("guide.switch_body") },
          ]}
        />
      </Box>
    </div>
  );
}
