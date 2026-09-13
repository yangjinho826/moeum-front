import { useForm, zodResolver } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { z } from "zod";

import type { AccountListItemType } from "_features/account/types";
import { useTransactionMutations } from "_features/transaction/queries/use-mutations";
import { getErrorMessage } from "_libraries/fetch/error-message";
import { todayIsoKst } from "_utilities/datetime";

import { useTransactionDetail as useTransactionDetailQuery } from "../../queries/use-query";
import type {
  TransactionBaseRequestType,
  TxType,
} from "../../types";

/** 거래 폼 값 — 요청 필드 + 수동자산 생성용 transient `valuation`(새 평가액 절대값). */
interface TxFormValues extends TransactionBaseRequestType {
  valuation: number;
}

interface UseTransactionFormOptions {
  transactionId?: string;
  /** 복사 원본 거래 id — 값만 가져오고 저장은 생성으로 간다(날짜는 오늘). */
  copyFromId?: string;
  /** 폼 옵션의 통장 목록 — 선택 통장 타입으로 평가조정 분기를 결정한다. */
  accounts: AccountListItemType[];
  /**
   * 성공/취소/삭제 완료 후 호출. 시트 모드: close 호출 (라우트 이동 X).
   * 없으면 기본 동작 = router.replace(/transactions) 또는 router.back().
   */
  onDone?: () => void;
}

export function useTransactionForm({
  transactionId,
  copyFromId,
  accounts,
  onDone,
}: UseTransactionFormOptions) {
  const t = useTranslations("transaction");
  const tg = useTranslations("general.common");
  const te = useTranslations("error");
  const router = useRouter();
  const routeParams = useParams<{ locale: string }>();

  const fetchDetail = useTransactionDetailQuery();
  const { createMutation, updateMutation, removeMutation } =
    useTransactionMutations();

  const isUpdate = Boolean(transactionId);

  const todayDate = todayIsoKst();

  const form = useForm<TxFormValues>({
    initialValues: {
      txType: "EXPENSE" as TxType,
      amount: 0,
      txDate: todayDate,
      accountId: "",
      toAccountId: null,
      categoryId: null,
      paidByUserId: null,
      fixedExpenseId: null,
      memo: null,
      valuationDirection: null,
      valuation: 0,
    },
    validate: zodResolver(
      z
        .object({
          txType: z.enum([
            "EXPENSE",
            "INCOME",
            "TRANSFER",
            "FIXED_EXPENSE",
            "VALUATION",
          ]),
          amount: z.number(),
          txDate: z.string().min(1),
          accountId: z.string().min(1, t("account_placeholder")),
          fixedExpenseId: z.string().nullable().optional(),
        })
        .superRefine((data, ctx) => {
          if (data.txType === "VALUATION") {
            // 수정 모드는 방향+금액 직접 입력, 생성 모드는 새 평가액으로 handleSubmit 에서 검증.
            if (transactionId && !(data.amount > 0)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["amount"],
                message: t("amount_required_message"),
              });
            }
            return;
          }
          if (!(data.amount > 0)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["amount"],
              message: t("amount_required_message"),
            });
          }
          if (data.txType === "FIXED_EXPENSE" && !data.fixedExpenseId) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["fixedExpenseId"],
              message: t("fixed_expense_item_required_message"),
            });
          }
        }),
    ),
  });

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.accountId === form.values.accountId),
    [accounts, form.values.accountId],
  );

  // 통장 선택 → 타입 동기화. 수동자산이면 평가조정 고정, 일반 통장으로 바꾸면 지출로 복귀.
  useEffect(() => {
    if (!selectedAccount) return;
    if (selectedAccount.isManualAsset && form.values.txType !== "VALUATION") {
      form.setFieldValue("txType", "VALUATION");
    } else if (!selectedAccount.isManualAsset && form.values.txType === "VALUATION") {
      form.setFieldValue("txType", "EXPENSE");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.accountId]);

  // 수정과 복사는 "기존 거래 값으로 폼을 채운다"가 같다 — 다른 건 저장 경로(update vs create)와
  // 날짜뿐이라 로딩 로직을 하나로 둔다.
  const sourceId = transactionId ?? copyFromId;

  useEffect(() => {
    if (!sourceId) return;
    let cancelled = false;
    (async () => {
      const res = await fetchDetail(sourceId);
      if (cancelled || !res) return;
      const d = res.body.data;
      form.setValues({
        txType: d.txType,
        amount: d.amount,
        // 복사는 "같은 지출을 이번 달에 또" 가 목적이라 날짜만 오늘로.
        txDate: transactionId ? d.txDate : todayDate,
        accountId: d.accountId,
        toAccountId: d.toAccountId,
        categoryId: d.categoryId,
        paidByUserId: d.paidByUserId,
        fixedExpenseId: d.fixedExpenseId,
        memo: d.memo,
        valuationDirection: d.valuationDirection ?? null,
        valuation: 0,
      });
    })();
    return () => {
      cancelled = true;
    };
    // transactionId 도 의존성 — 같은 거래를 수정→복사로 전환하면 sourceId 는 그대로라
    // 이것 없이는 날짜를 오늘로 바꾸는 재실행이 일어나지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceId, transactionId]);

  const handleSubmit = async () => {
    try {
      // valuation 은 transient — 요청 페이로드에서 제외.
      const { valuation, ...txValues } = form.values;
      const isValuation = txValues.txType === "VALUATION";

      if (isUpdate) {
        if (!transactionId) throw new Error("No transactionId for update");
        await updateMutation.mutateAsync({ transactionId, ...txValues });
      } else if (isValuation) {
        // 새 평가액 절대값 → (새값 − 현재잔액) 차액을 평가조정 거래로 생성.
        // 빈 칸(0)으로 제출하면 잔액 전체가 감소 거래가 된다 — 입력 요구 (배치3 S6 B-4). 자산을 없애려면 자산 삭제
        if (!(Number(valuation) > 0)) {
          form.setFieldError("valuation", t("valuation_required_message"));
          return;
        }
        const diff = valuation - (selectedAccount?.balance ?? 0);
        if (diff === 0) {
          form.setFieldError("valuation", t("valuation_no_change_message"));
          return;
        }
        await createMutation.mutateAsync({
          txType: "VALUATION",
          amount: Math.abs(diff),
          valuationDirection: diff > 0 ? "INCREASE" : "DECREASE",
          txDate: txValues.txDate,
          accountId: txValues.accountId,
          toAccountId: null,
          categoryId: null,
          paidByUserId: null,
          fixedExpenseId: null,
          memo: txValues.memo,
        });
      } else {
        await createMutation.mutateAsync({ ...txValues });
      }
      notifications.show({
        title: tg("notificationstitle"),
        message: isUpdate
          ? tg("update_has_been_completed")
          : tg("register_has_been_completed"),
        color: "positive",
      });
      if (onDone) {
        onDone();
      } else {
        router.replace(`/${routeParams.locale}/transactions`);
      }
    } catch (error) {
      notifications.show({
        title: tg("notificationstitle"),
        message: getErrorMessage(error, te),
        color: "danger",
      });
    }
  };

  const handleRemove = () => {
    if (!transactionId) return;
    modals.openConfirmModal({
      centered: true,
      title: tg("confirmtitle"),
      // 파괴적 확인 = danger (DESIGN §2-3) — 폼 삭제 확인 공통
      labels: { confirm: tg("delete"), cancel: tg("cancel") },
      confirmProps: { color: "danger" },
      children: <span>{tg("want_to_delete")}</span>,
      onConfirm: async () => {
        try {
          await removeMutation.mutateAsync(transactionId);
          notifications.show({
            title: tg("notificationstitle"),
            message: tg("confirmyescontent"),
            color: "positive",
          });
          if (onDone) {
            onDone();
          } else {
            router.replace(`/${routeParams.locale}/transactions`);
          }
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
    if (onDone) {
      onDone();
    } else {
      router.back();
    }
  };

  return {
    form,
    isUpdate,
    selectedAccount,
    isPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      removeMutation.isPending,
    handleSubmit,
    handleRemove,
    handleCancel,
  };
}
