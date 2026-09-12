"use client";

import { Box, Button, Group, Stack, Text, TextInput, UnstyledButton } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";

import { queryKeys } from "_constants/queries";
import { GetAuthUserSearchByEmailApi } from "_features/auth/api";
import FormGuide from "_features/common/components/form-guide";
import ListRow from "_features/common/components/list-row";
import Section from "_features/common/components/section";
import { useHouseholdMutations } from "_features/household/queries/use-mutations";
import SubHeader from "_features/layout/components/sub-header";
import { ApiResponseError } from "_libraries/fetch/api-response-error";
import { getErrorMessage } from "_libraries/fetch/error-message";

const EMAIL_RE = /^[\w.-]+@[\w.-]+\.\w+$/;

interface MembersSectionProps {
  householdId: string;
  /** 시트 안에서 렌더 시 — 자체 SubHeader·도움말 레일 숨김(FormSheet 제목 사용) */
  inSheet?: boolean;
}

/**
 * 멤버 관리 (plan/6.md, Figma 76:111) — MembersSheet 가 정본, 라우트는 fallback.
 * "{가계부} 멤버 N" 목록(이름 / 역할 · 이메일) → 소유자만 "멤버 초대"(가입한 이메일) · 소유자 외 행 끝 "내보내기".
 * 백엔드: 초대·내보내기 = 소유자만, 소유자 본인은 못 나감, 내보내도 그 사람이 남긴 기록은 남음(soft delete).
 */
export default function MembersSection({ householdId, inSheet = false }: MembersSectionProps) {
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("household.member");
  const tAuth = useTranslations("auth");
  const tg = useTranslations("general.common");
  const te = useTranslations("error");

  const { data: hData } = useSuspenseQuery(queryKeys.household.detail(householdId));
  const { data: mData } = useSuspenseQuery(queryKeys.household.members(householdId));

  const household = hData.body.data;
  const members = mData.body.data.items;
  const isOwner = household.role === "OWNER";

  const { addMemberMutation, removeMemberMutation } = useHouseholdMutations();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    const target = email.trim();
    if (!target) return;
    // 백엔드와 같은 형식 검사 — 틀린 형식으로 사용자 검색까지 가지 않게
    if (!EMAIL_RE.test(target)) {
      setEmailError(tAuth("email_format_message"));
      return;
    }

    setSearching(true);
    try {
      const userRes = await GetAuthUserSearchByEmailApi(target);
      const user = userRes.body.data;
      await addMemberMutation.mutateAsync({ householdId, userId: user.id, role: "MEMBER" });
      notifications.show({
        title: t("invite_success_title"),
        message: t("invite_success_message", { name: user.name, email: user.email }),
        color: "positive",
      });
      setEmail("");
    } catch (error) {
      // 미가입 이메일 → 백엔드 NOT_FOUND (CM004) — 필드 아래에 바로 알려준다
      if (error instanceof ApiResponseError && error.errorCode === "CM004") {
        setEmailError(t("user_not_found"));
        return;
      }
      notifications.show({
        title: t("invite_failed_title"),
        message: getErrorMessage(error, te),
        color: "danger",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleRemove = (memberId: string, memberName: string) => {
    modals.openConfirmModal({
      centered: true,
      title: t("remove_confirm_title"),
      labels: { confirm: t("remove"), cancel: tg("cancel") },
      confirmProps: { color: "danger" },
      children: <Text style={{ fontSize: 15, lineHeight: "23px" }}>{t("remove_confirm", { name: memberName })}</Text>,
      onConfirm: async () => {
        try {
          await removeMemberMutation.mutateAsync({ householdId, memberId });
          notifications.show({
            title: t("remove_success_title"),
            message: t("remove_success_message", { name: memberName }),
            color: "positive",
          });
        } catch (error) {
          notifications.show({
            title: t("remove_failed_title"),
            message: getErrorMessage(error, te),
            color: "danger",
          });
        }
      },
    });
  };

  const content = (
    <Stack gap={0}>
      {/* 첫 섹션 — 헤더(시트 제목·SubHeader) 바로 아래라 구분선 없이 */}
      <Section
        hairline={false}
        title={
          <>
            {t("list_title", { name: household.name })}{" "}
            <Text component="span" inherit c="dimmed" className="moeum-mono" fw={600}>
              {members.length}
            </Text>
          </>
        }
      >
        {members.map((m, i) => {
          const name = m.userName ?? t("unknown_name");
          const canRemove = isOwner && m.role !== "OWNER";
          return (
            <ListRow
              key={m.memberId}
              tall
              title={name}
              meta={t("row_meta", {
                role: m.role === "OWNER" ? t("role_owner") : t("role_member"),
                email: m.userEmail ?? "—",
              })}
              last={i === members.length - 1}
              action={
                canRemove ? (
                  <UnstyledButton
                    onClick={() => handleRemove(m.memberId, name)}
                    aria-label={t("remove_aria", { name })}
                    // 글자 13 · 히트 44 — 위아래 패딩을 음수 마진으로 상쇄해 행 높이는 그대로(DESIGN §4)
                    style={{
                      fontSize: 13,
                      lineHeight: "19px",
                      fontWeight: 600,
                      color: "var(--mantine-color-danger-text)",
                      padding: "12px 0 12px 12px",
                      margin: "-12px 0",
                    }}
                  >
                    {t("remove")}
                  </UnstyledButton>
                ) : undefined
              }
            />
          );
        })}
      </Section>

      {isOwner ? (
        <Section title={t("invite_section_title")}>
            <form onSubmit={handleInvite} noValidate>
              <TextInput
                value={email}
                onChange={(e) => {
                  setEmail(e.currentTarget.value);
                  setEmailError(null);
                }}
                label={tAuth("email")}
                placeholder="email@example.com"
                type="email"
                autoComplete="off"
                description={t("invite_desc")}
                error={emailError}
                mt={4}
                inputWrapperOrder={["label", "input", "description", "error"]}
                // 필드와 "초대" 버튼 한 줄 — 둘 다 높이 44
                inputContainer={(children) => (
                  <Group gap={8} wrap="nowrap" align="flex-start">
                    <Box style={{ flex: 1, minWidth: 0 }}>{children}</Box>
                    <Button
                      type="submit"
                      loading={searching || addMemberMutation.isPending}
                      disabled={!email.trim()}
                    >
                      {t("invite_button")}
                    </Button>
                  </Group>
                )}
              />
            </form>
        </Section>
      ) : (
        // 멤버가 볼 때 — 초대·내보내기가 왜 없는지
        <Text c="dimmed" mt={12} style={{ fontSize: 13, lineHeight: "19px" }}>
          {t("owner_only")}
        </Text>
      )}
    </Stack>
  );

  if (inSheet) return content;

  return (
    // 페이지 모드(fallback 라우트) — 좌 목록·초대 · 우 레일 도움말 (DESIGN §5 폼 필드)
    <div className="moeum-main-rail">
      <Stack gap="md">
        <SubHeader title={t("title")} back={`/${locale}/settings`} />
        {content}
      </Stack>
      <Box visibleFrom="lg" pt={48}>
        <FormGuide
          items={[
            { title: t("guide.invite_title"), body: t("guide.invite_body") },
            { title: t("guide.role_title"), body: t("guide.role_body") },
            { title: t("guide.remove_title"), body: t("guide.remove_body") },
          ]}
        />
      </Box>
    </div>
  );
}
