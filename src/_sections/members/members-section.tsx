"use client";

import {
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  IconCrown,
  IconSearch,
  IconTrash,
  IconUserPlus,
} from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";

import { GetAuthUserSearchByEmailApi } from "_features/auth/api";
import { useHouseholdMutations } from "_features/household/queries/use-mutations";
import SubHeader from "_features/layout/components/sub-header";
import { queryKeys } from "_constants/queries";
import { ApiResponseError } from "_libraries/fetch/api-response-error";
import { getErrorMessage } from "_libraries/fetch/error-message";
import { useTranslations } from "next-intl";

interface MembersSectionProps {
  householdId: string;
  /** 시트 안에서 렌더 시 — 자체 SubHeader 숨김(FormSheet 제목 사용) */
  inSheet?: boolean;
}

export default function MembersSection({
  householdId,
  inSheet = false,
}: MembersSectionProps) {
  const routeParams = useParams<{ locale: string }>();
  const t = useTranslations("household.member");
  const tg = useTranslations("general.common");
  const te = useTranslations("error");

  const { data: hData } = useSuspenseQuery(
    queryKeys.household.detail(householdId),
  );
  const { data: mData } = useSuspenseQuery(
    queryKeys.household.members(householdId),
  );

  const household = hData.body.data;
  const members = mData.body.data.items;
  const isOwner = household.role === "OWNER";

  const { addMemberMutation, removeMemberMutation } = useHouseholdMutations();

  const [email, setEmail] = useState("");
  const [searching, setSearching] = useState(false);

  const handleInvite = async () => {
    const target = email.trim();
    if (!target) return;

    setSearching(true);
    try {
      // 이메일로 user 검색
      const userRes = await GetAuthUserSearchByEmailApi(target);
      const user = userRes.body.data;

      // 멤버 추가
      await addMemberMutation.mutateAsync({
        householdId,
        userId: user.id,
        role: "MEMBER",
      });

      notifications.show({
        title: t("invite_success_title"),
        message: t("invite_success_message", {
          name: user.name,
          email: user.email,
        }),
        color: "positive",
      });
      setEmail("");
    } catch (error) {
      // 미가입 이메일 → 백엔드 NOT_FOUND (CM004)
      let message = getErrorMessage(error, te);
      if (error instanceof ApiResponseError && error.errorCode === "CM004") {
        message = t("user_not_found");
      }
      notifications.show({
        title: t("invite_failed_title"),
        message,
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
      labels: { confirm: tg("delete"), cancel: tg("cancel") },
      confirmProps: { color: "danger" },
      children: <span>{t("remove_confirm", { name: memberName })}</span>,
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

  return (
    <Stack gap="md">
      {!inSheet && (
        <SubHeader title={t("title")} back={`/${routeParams.locale}/settings`} />
      )}

      <Text size="xs" c="dimmed" px={4}>
        {t("subtitle", { name: household.name, count: members.length })}
      </Text>

      {/* 멤버 초대 — owner 만 */}
      {isOwner && (
        <Card radius="lg">
          <Stack gap="sm">
            <Text size="sm" fw={700}>
              {t("invite_section_title")}
            </Text>
            <Text size="xs" c="dimmed">
              {t("invite_section_hint")}
            </Text>
            <Group gap={8} wrap="nowrap">
              <TextInput
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                placeholder="email@example.com"
                type="email"
                leftSection={<IconSearch size={14} />}
                style={{ flex: 1 }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleInvite();
                }}
              />
              <Button
                leftSection={<IconUserPlus size={14} />}
                onClick={handleInvite}
                loading={searching || addMemberMutation.isPending}
                disabled={!email.trim()}
              >
                {t("invite_button")}
              </Button>
            </Group>
          </Stack>
        </Card>
      )}

      {/* 멤버 리스트 */}
      <Card radius="lg" p="xs">
        <Stack gap={0}>
          {members.map((m) => {
            const isMemberOwner = m.role === "OWNER";
            const canRemove = isOwner && !isMemberOwner;
            return (
              <Group
                key={m.memberId}
                gap={12}
                wrap="nowrap"
                style={{ padding: 12 }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    background: isMemberOwner
                      ? "var(--mantine-color-info-0)"
                      : "var(--mantine-color-gray-1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Text
                    size="sm"
                    fw={800}
                    c={isMemberOwner ? "info.5" : undefined}
                  >
                    {m.userName?.[0] ?? "?"}
                  </Text>
                </div>
                <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                  <Group gap={6} wrap="nowrap">
                    <Text size="sm" fw={700} truncate>
                      {m.userName ?? t("unknown_name")}
                    </Text>
                    {isMemberOwner && (
                      <IconCrown
                        size={12}
                        color="#F59E0B"
                        fill="#F59E0B"
                        style={{ flexShrink: 0 }}
                      />
                    )}
                  </Group>
                  <Text size="xs" c="dimmed" truncate>
                    {m.userEmail ?? "—"}
                  </Text>
                </Stack>
                {canRemove ? (
                  <UnstyledButton
                    onClick={() =>
                      handleRemove(m.memberId, m.userName ?? t("this_member"))
                    }
                    // 터치타깃 28→40px — 음수 마진으로 시각 레이아웃은 그대로
                    style={{ padding: 12, margin: -6, borderRadius: 8 }}
                  >
                    <IconTrash size={16} color="#EF4444" />
                  </UnstyledButton>
                ) : (
                  <Text size="10px" fw={700} c="dimmed">
                    {isMemberOwner ? t("role_owner") : t("role_member")}
                  </Text>
                )}
              </Group>
            );
          })}
        </Stack>
      </Card>
    </Stack>
  );
}
