import { useForm, zodResolver } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { z } from "zod";

import { usePortfolioMutations } from "_features/portfolio/queries/use-mutations";
import type { Market } from "_features/portfolio/types";
import { getErrorMessage } from "_libraries/fetch/error-message";

import { usePortfolioItemFetch } from "../../queries/use-query";

interface UsePortfolioFormOptions {
  portfolioId?: string;
  /** 시트에서 사용 시 — 성공·취소 후 페이지 이동 대신 이 콜백(시트 close) 호출 */
  onDone?: () => void;
}

interface FormValues {
  accountId: string;
  market: Market;
  code: string;
  name: string;
  currentPrice: number;
  isArchived: boolean;
}

export function usePortfolioForm({
  portfolioId,
  onDone,
}: UsePortfolioFormOptions) {
  const t = useTranslations("portfolio");
  const tg = useTranslations("general.common");
  const te = useTranslations("error");
  const router = useRouter();
  const routeParams = useParams<{ locale: string }>();

  const fetchDetail = usePortfolioItemFetch();
  const { createMutation, updateMutation, lookupMutation } = usePortfolioMutations();

  const isUpdate = Boolean(portfolioId);
  // 보유수량 — 삭제(보관) 가드용. >0 이면 삭제 버튼 비활성(백엔드도 차단).
  const [quantity, setQuantity] = useState(0);

  const form = useForm<FormValues>({
    initialValues: {
      accountId: "",
      market: "KRX_KOSPI",
      code: "",
      name: "",
      currentPrice: 0,
      isArchived: false,
    },
    validateInputOnBlur: true,
    validate: zodResolver(
      z
        .object({
          accountId: z.string().min(1, t("account_required_message")),
          market: z.enum(["KRX_KOSPI", "KRX_KOSDAQ", "NASDAQ", "NYSE", "OTHER"]),
          code: z.string(),
          name: z.string().min(1, t("name_required_message")),
          currentPrice: z.number().positive(t("current_price_required_message")),
        })
        .superRefine((val, ctx) => {
          // OTHER (야후 미지원) 면 code 빈문자열 OK, 그 외엔 필수
          if (val.market !== "OTHER" && val.code.trim().length < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t("code_required_message"),
              path: ["code"],
            });
          }
        }),
    ),
  });

  useEffect(() => {
    if (!portfolioId) return;
    let cancelled = false;
    (async () => {
      const res = await fetchDetail(portfolioId);
      if (cancelled || !res) return;
      const d = res.body.data;
      setQuantity(d.quantity);
      form.setValues({
        accountId: d.accountId,
        market: d.market,
        code: d.code,
        name: d.name,
        currentPrice: d.currentPrice,
        isArchived: d.isArchived,
      });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioId]);

  const handleLookup = async () => {
    const market = form.values.market;
    const code = form.values.code.trim();
    if (!code) return;
    try {
      const res = await lookupMutation.mutateAsync({ market, code });
      const d = res.body.data;
      if (!isUpdate) form.setFieldValue("name", d.name);
      form.setFieldValue("currentPrice", d.currentPrice);
      notifications.show({
        title: tg("notificationstitle"),
        message: `${d.name} · ${d.yahooSymbol}`,
        color: "positive",
      });
    } catch (error) {
      notifications.show({
        title: tg("notificationstitle"),
        message: getErrorMessage(error, te),
        color: "danger",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (isUpdate) {
        if (!portfolioId) throw new Error("No portfolioId for update");
        await updateMutation.mutateAsync({
          portfolioId,
          currentPrice: form.values.currentPrice,
          name: form.values.name,
          code: form.values.code,
          market: form.values.market,
          isArchived: form.values.isArchived,
        });
        notifications.show({
          title: tg("notificationstitle"),
          message: tg("update_has_been_completed"),
          color: "positive",
        });
      } else {
        // 종목 메타 등록 (qty=0 시작) — 매수는 디테일에서 별도
        await createMutation.mutateAsync({
          name: form.values.name,
          code: form.values.code,
          market: form.values.market,
          currentPrice: form.values.currentPrice,
          accountId: form.values.accountId,
        });
        notifications.show({
          title: tg("notificationstitle"),
          message: tg("register_has_been_completed"),
          color: "positive",
        });
      }
      if (onDone) onDone();
      else router.replace(`/${routeParams.locale}/invest`);
    } catch (error) {
      notifications.show({
        title: tg("notificationstitle"),
        message: getErrorMessage(error, te),
        color: "danger",
      });
    }
  };

  const handleRemove = () => {
    if (!portfolioId) return;
    modals.openConfirmModal({
      centered: true,
      title: tg("confirmtitle"),
      // 파괴적 확인 = danger (DESIGN §2-3). 백엔드는 보관(is_archived) — 지난 매매 기록은 남는다
      labels: { confirm: tg("delete"), cancel: tg("cancel") },
      confirmProps: { color: "danger" },
      children: <span>{t("delete_confirm_body")}</span>,
      onConfirm: async () => {
        try {
          await updateMutation.mutateAsync({ portfolioId, isArchived: true });
          notifications.show({
            title: tg("notificationstitle"),
            message: tg("confirmyescontent"),
            color: "positive",
          });
          if (onDone) onDone();
          else router.replace(`/${routeParams.locale}/invest`);
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
    quantity,
    isPending: createMutation.isPending || updateMutation.isPending,
    isLookupPending: lookupMutation.isPending,
    handleLookup,
    handleSubmit,
    handleRemove,
    handleCancel,
  };
}
