import { useForm, zodResolver } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { z } from "zod";

import { useHouseholdMutations } from "_features/household/queries/use-mutations";
import { getErrorMessage } from "_libraries/fetch/error-message";

import { useHouseholdDetail as useHouseholdDetailQuery } from "../../queries/use-query";
import type {
  HouseholdBaseRequestType,
  HouseholdCreateRequest,
} from "../../types";

interface UseHouseholdFormOptions {
  householdId?: string;
  /** 시트에서 사용 시 — 성공·취소 후 페이지 이동 대신 이 콜백(시트 close) 호출 */
  onDone?: () => void;
}

export function useHouseholdForm({
  householdId,
  onDone,
}: UseHouseholdFormOptions) {
  const t = useTranslations("household");
  const tg = useTranslations("general.common");
  const te = useTranslations("error");
  const router = useRouter();
  const routeParams = useParams<{ locale: string }>();

  const fetchDetail = useHouseholdDetailQuery();
  const { createMutation, updateMutation, removeMutation } =
    useHouseholdMutations();

  const isUpdate = Boolean(householdId);

  const todayDate = new Date().toISOString().slice(0, 10);

  const form = useForm<HouseholdCreateRequest>({
    initialValues: {
      name: "",
      description: null,
      currency: "KRW",
      startedAt: todayDate,
    },
    validate: zodResolver(
      z.object({
        name: z.string().min(1, t("name_required_message")),
        currency: z.string().min(3).max(3),
      }),
    ),
  });

  useEffect(() => {
    if (!householdId) return;
    let cancelled = false;
    (async () => {
      const res = await fetchDetail(householdId);
      if (cancelled || !res) return;
      const d = res.body.data;
      form.setValues({
        name: d.name,
        description: d.description,
        currency: d.currency,
        startedAt: d.startedAt,
      });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [householdId]);

  const handleSubmit = async () => {
    try {
      if (isUpdate) {
        if (!householdId) throw new Error("No householdId for update");
        const updatePayload = {
          householdId,
          ...form.values,
        } satisfies HouseholdBaseRequestType & { householdId: string };
        await updateMutation.mutateAsync(updatePayload);
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
      else router.replace(`/${routeParams.locale}/household`);
    } catch (error) {
      notifications.show({
        title: tg("notificationstitle"),
        message: getErrorMessage(error, te),
        color: "danger",
      });
    }
  };

  const handleRemove = () => {
    if (!householdId) return;
    // 가계부 삭제 = 모든 자식(통장·거래·종목 등) cascade soft-delete → 강한 경고.
    modals.openConfirmModal({
      centered: true,
      title: t("delete_confirm_title"),
      labels: { confirm: tg("delete"), cancel: tg("cancel") },
      confirmProps: { color: "danger" },
      children: <span>{t("delete_confirm_message")}</span>,
      onConfirm: async () => {
        try {
          await removeMutation.mutateAsync(householdId);
          notifications.show({
            title: tg("notificationstitle"),
            message: tg("confirmyescontent"),
            color: "positive",
          });
          if (onDone) onDone();
          else router.replace(`/${routeParams.locale}/household`);
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
