import { useForm, zodResolver } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { z } from "zod";

import { useFixedMutations } from "_features/fixed/queries/use-mutations";
import { getErrorMessage } from "_libraries/fetch/error-message";

import { useFixedDetail as useFixedDetailQuery } from "../../queries/use-query";
import type { FixedBaseRequestType } from "../../types";

interface UseFixedFormOptions {
  fixedId?: string;
  /** 시트에서 사용 시 — 성공·취소 후 페이지 이동 대신 이 콜백(시트 close) 호출 */
  onDone?: () => void;
}

export function useFixedForm({ fixedId, onDone }: UseFixedFormOptions) {
  const t = useTranslations("fixed");
  const tg = useTranslations("general.common");
  const te = useTranslations("error");
  const router = useRouter();
  const routeParams = useParams<{ locale: string }>();

  const fetchDetail = useFixedDetailQuery();
  const { createMutation, updateMutation, removeMutation } = useFixedMutations();

  const isUpdate = Boolean(fixedId);

  const form = useForm<FixedBaseRequestType>({
    initialValues: {
      name: "",
      amount: 0,
      dayOfMonth: 1,
      categoryId: null,
      color: null,
      icon: null,
      sortOrder: 0,
      isArchived: false,
    },
    validate: zodResolver(
      z.object({
        name: z.string().min(1, t("name_required_message")),
        amount: z.number(),
        dayOfMonth: z.number().min(1).max(31),
      }),
    ),
  });

  useEffect(() => {
    if (!fixedId) return;
    let cancelled = false;
    (async () => {
      const res = await fetchDetail(fixedId);
      if (cancelled || !res) return;
      const d = res.body.data;
      form.setValues({
        name: d.name,
        amount: d.amount,
        dayOfMonth: d.dayOfMonth,
        categoryId: d.categoryId,
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
  }, [fixedId]);

  const handleSubmit = async () => {
    try {
      if (isUpdate) {
        if (!fixedId) throw new Error("No fixedId for update");
        await updateMutation.mutateAsync({ fixedId, ...form.values });
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
      else router.replace(`/${routeParams.locale}/fixed`);
    } catch (error) {
      notifications.show({
        title: tg("notificationstitle"),
        message: getErrorMessage(error, te),
        color: "danger",
      });
    }
  };

  const handleRemove = () => {
    if (!fixedId) return;
    modals.openConfirmModal({
      centered: true,
      title: tg("confirmtitle"),
      labels: { confirm: tg("confirm"), cancel: tg("cancel") },
      children: <span>{tg("want_to_delete")}</span>,
      onConfirm: async () => {
        try {
          await removeMutation.mutateAsync(fixedId);
          notifications.show({
            title: tg("notificationstitle"),
            message: tg("confirmyescontent"),
            color: "positive",
          });
          if (onDone) onDone();
          else router.replace(`/${routeParams.locale}/fixed`);
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
