import { useForm, zodResolver } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { z } from "zod";

import { useAccountMutations } from "_features/account/queries/use-mutations";
import { getErrorMessage } from "_libraries/fetch/error-message";

import { useAccountDetail as useAccountDetailQuery } from "../../queries/use-query";
import type {
  AccountBaseRequestType,
  AccountType,
} from "../../types";

interface UseAccountFormOptions {
  accountId?: string; // 있으면 update, 없으면 create
  /** 시트에서 사용 시 — 성공·취소 후 페이지 이동 대신 이 콜백(시트 close) 호출 */
  onDone?: () => void;
}

export function useAccountForm({ accountId, onDone }: UseAccountFormOptions) {
  const t = useTranslations("account");
  const tg = useTranslations("general.common");
  const te = useTranslations("error");
  const router = useRouter();
  const routeParams = useParams<{ locale: string }>();

  const fetchDetail = useAccountDetailQuery();
  const { createMutation, updateMutation, removeMutation } =
    useAccountMutations();

  const isUpdate = Boolean(accountId);

  const form = useForm<AccountBaseRequestType>({
    initialValues: {
      name: "",
      accountType: "LIVING" as AccountType,
      startBalance: 0,
      color: null,
      icon: null,
      sortOrder: 0,
      isArchived: false,
    },
    validate: zodResolver(
      z.object({
        name: z.string().min(1, t("name_required_message")),
        accountType: z.enum(["LIVING", "SAVINGS", "INVESTMENT", "OTHER"]),
        startBalance: z.number(),
      }),
    ),
  });

  // update 모드: id 받으면 detail 로드 → form 채움
  useEffect(() => {
    if (!accountId) return;
    let cancelled = false;
    (async () => {
      const res = await fetchDetail(accountId);
      if (cancelled || !res) return;
      const d = res.body.data;
      form.setValues({
        name: d.name,
        accountType: d.accountType,
        startBalance: d.startBalance,
        color: d.color,
        icon: d.icon,
        sortOrder: d.sortOrder,
        isArchived: d.isArchived,
      });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  const handleSubmit = async () => {
    try {
      if (isUpdate) {
        if (!accountId) throw new Error("No accountId for update");
        await updateMutation.mutateAsync({
          accountId,
          ...form.values,
        });
        notifications.show({
          title: tg("notificationstitle"),
          message: tg("update_has_been_completed"),
          color: "positive",
        });
      } else {
        await createMutation.mutateAsync({ ...form.values });
        notifications.show({
          title: tg("notificationstitle"),
          message: tg("register_has_been_completed"),
          color: "positive",
        });
      }
      if (onDone) onDone();
      else router.replace(
        // 수정은 그 통장 상세로, 생성은 목록(자산 화면)으로 (배치3 S6 F-310)
        isUpdate && accountId
          ? `/${routeParams.locale}/account/${accountId}`
          : `/${routeParams.locale}/wealth`,
      );
    } catch (error) {
      notifications.show({
        title: tg("notificationstitle"),
        message: getErrorMessage(error, te),
        color: "danger",
      });
    }
  };

  const handleRemove = () => {
    if (!accountId) return;
    modals.openConfirmModal({
      centered: true,
      title: tg("confirmtitle"),
      labels: { confirm: tg("confirm"), cancel: tg("cancel") },
      children: <span>{tg("want_to_delete")}</span>,
      onConfirm: async () => {
        try {
          await removeMutation.mutateAsync(accountId);
          notifications.show({
            title: tg("notificationstitle"),
            message: tg("confirmyescontent"),
            color: "positive",
          });
          if (onDone) onDone();
          else router.replace(`/${routeParams.locale}/wealth`);
        } catch (error) {
          notifications.show({
            title: tg("notificationstitle"),
            message: getErrorMessage(error, te),
            color: "danger",
          });
        }
      },
    });
  };

  const handleCancel = () => {
    if (onDone) onDone();
    else router.back();
  };

  return {
    form,
    isUpdate,
    isPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      removeMutation.isPending,
    handleSubmit,
    handleRemove,
    handleCancel,
  };
}
