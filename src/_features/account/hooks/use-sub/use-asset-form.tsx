import { useForm, zodResolver } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { useAccountMutations } from "_features/account/queries/use-mutations";
import type {
  AccountListItemType,
  ManualAssetAccountType,
} from "_features/account/types";
import { getErrorMessage } from "_libraries/fetch/error-message";

interface UseAssetFormOptions {
  /** 있으면 수정 모드 — 없으면 신규 등록 */
  account?: AccountListItemType;
  onClose?: () => void;
}

interface AssetFormValues {
  name: string;
  accountType: ManualAssetAccountType;
  startBalance: number; // 초기금. 평가금 변동은 거래(+)의 평가조정으로 따로 반영한다.
}

export function useAssetForm({ account, onClose }: UseAssetFormOptions) {
  const t = useTranslations("account.asset");
  const tg = useTranslations("general.common");
  const te = useTranslations("error");

  const {
    createMutation: accountCreate,
    updateMutation: accountUpdate,
    removeMutation: accountRemove,
  } = useAccountMutations();

  const isUpdate = Boolean(account);

  const form = useForm<AssetFormValues>({
    initialValues: {
      name: account?.name ?? "",
      accountType: (account?.accountType as ManualAssetAccountType) ?? "REAL_ESTATE",
      startBalance: account?.startBalance ?? 0,
    },
    validateInputOnBlur: true,
    validate: zodResolver(
      z.object({
        name: z.string().min(1, t("name_required_message")),
        accountType: z.enum([
          "REAL_ESTATE",
          "PENSION",
          "COMMODITY",
          "SAVINGS_ASSET",
        ]),
        startBalance: z.number().min(0, t("start_balance_required_message")),
      }),
    ),
  });

  const handleSubmit = async () => {
    try {
      if (isUpdate && account) {
        // 이름·타입·초기금 수정. 평가금 변동은 거래(+)의 평가조정으로 따로 반영한다.
        await accountUpdate.mutateAsync({
          accountId: account.accountId,
          name: form.values.name,
          accountType: form.values.accountType,
          startBalance: form.values.startBalance,
          color: account.color,
          icon: account.icon,
          sortOrder: account.sortOrder,
          isArchived: account.isArchived,
        });
        notifications.show({
          title: tg("notificationstitle"),
          message: tg("update_has_been_completed"),
          color: "positive",
        });
      } else {
        // 신규 자산 = 통장 생성. 초기금이 곧 start_balance.
        await accountCreate.mutateAsync({
          name: form.values.name,
          accountType: form.values.accountType,
          startBalance: form.values.startBalance,
          color: null,
          icon: null,
          sortOrder: 0,
          isArchived: false,
        });
        notifications.show({
          title: tg("notificationstitle"),
          message: tg("register_has_been_completed"),
          color: "positive",
        });
      }
      onClose?.();
    } catch (error) {
      notifications.show({
        title: tg("notificationstitle"),
        message: getErrorMessage(error, te),
        color: "danger",
      });
    }
  };

  const handleRemove = () => {
    if (!account) return;
    modals.openConfirmModal({
      centered: true,
      title: tg("confirmtitle"),
      labels: { confirm: tg("confirm"), cancel: tg("cancel") },
      children: <span>{tg("want_to_delete")}</span>,
      onConfirm: async () => {
        try {
          await accountRemove.mutateAsync(account.accountId);
          notifications.show({
            title: tg("notificationstitle"),
            message: tg("confirmyescontent"),
            color: "positive",
          });
          onClose?.();
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

  const handleCancel = () => onClose?.();

  return {
    form,
    isUpdate,
    isPending:
      accountCreate.isPending ||
      accountUpdate.isPending ||
      accountRemove.isPending,
    handleSubmit,
    handleRemove,
    handleCancel,
  };
}
