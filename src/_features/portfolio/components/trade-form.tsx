"use client";

import {
  Group,
  NumberInput,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useTranslations } from "next-intl";
import { useState } from "react";

import FormActions from "_features/common/components/form-actions";
import { useEnumOptions } from "_features/enum/queries/use-query";
import { getErrorMessage } from "_libraries/fetch/error-message";
import { semanticColor } from "_styles/semantic-color";
import { todayIsoKst } from "_utilities/datetime";
import { fmt } from "_utilities/fmt";

import { usePortfolioMutations } from "../queries/use-mutations";
import type {
  PortfolioTransactionItemType,
  PortfolioTxType,
} from "../types";

interface TradeFormProps {
  /** 종목 ID (필수 — 매수/매도 모두 기존 종목에 대해 수행) */
  portfolioId: string;
  initialType?: PortfolioTxType;
  /** 있으면 수정 모드 — initialValues 채움 + tradeType 잠금 + 삭제 버튼 노출 */
  editingTx?: PortfolioTransactionItemType;
  /** soldOut=true → 전량 매도로 종목이 사라짐 (호출 측이 화면 이탈 처리) */
  onSuccess?: (soldOut?: boolean) => void;
  /** 시트/모달에서 사용할 때 — 취소 버튼 노출 + 닫기 콜백 */
  onCancel?: () => void;
}

interface FormValues {
  tradeType: PortfolioTxType;
  quantity: number;
  price: number;
  fee: number;
  txDate: string;
  memo: string;
}

export default function TradeForm({
  portfolioId,
  initialType = "BUY",
  editingTx,
  onSuccess,
  onCancel,
}: TradeFormProps) {
  const te = useTranslations("error");
  const tg = useTranslations("general");
  const t = useTranslations("portfolio");
  const tPt = useTranslations("enum.portfolio-tx-type");
  const { data: ptTypeData } = useEnumOptions("portfolio-tx-type");
  const {
    buyMutation,
    sellMutation,
    updateTxMutation,
    removeTxMutation,
  } = usePortfolioMutations();
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!editingTx;

  const form = useForm<FormValues>({
    initialValues: {
      tradeType: editingTx?.ptType ?? initialType,
      quantity: editingTx?.quantity ?? 0,
      price: editingTx?.price ?? 0,
      fee: editingTx?.fee ?? 0,
      txDate: editingTx?.txDate ?? todayIsoKst(),
      memo: editingTx?.memo ?? "",
    },
    validate: {
      quantity: (v) => (v > 0 ? null : t("quantity_required")),
      price: (v) => (v > 0 ? null : t("price_required")),
      fee: (v) => (v >= 0 ? null : t("fee_negative")),
      txDate: (v) => (v ? null : t("tx_date_required")),
    },
  });

  const handleSubmit = async (raw: FormValues) => {
    setSubmitting(true);
    let soldOut = false;
    // NumberInput 이 문자열을 흘려보낼 수 있어 요청 직전에 숫자로 고정한다.
    const values: FormValues = {
      ...raw,
      quantity: Number(raw.quantity) || 0,
      price: Number(raw.price) || 0,
      fee: Number(raw.fee) || 0,
    };
    try {
      if (editingTx) {
        await updateTxMutation.mutateAsync({
          txId: editingTx.txId,
          quantity: values.quantity,
          price: values.price,
          fee: values.fee,
          txDate: values.txDate,
          memo: values.memo.trim() || null,
        });
        notifications.show({
          title: t("edit_done_title"),
          message: t("edit_done_msg"),
          color: editingTx.ptType === "BUY" ? "red" : "blue",
        });
      } else if (values.tradeType === "BUY") {
        await buyMutation.mutateAsync({
          portfolioId,
          quantity: values.quantity,
          price: values.price,
          fee: values.fee,
          txDate: values.txDate,
          memo: values.memo.trim() || null,
        });
        notifications.show({
          title: t("buy_done_title"),
          message: t("buy_done_msg"),
          color: "red",
        });
      } else {
        // 전량 매도 시 백엔드가 종목을 soft delete 하고 data=null 반환 → soldOut 신호
        const res = await sellMutation.mutateAsync({
          portfolioId,
          quantity: values.quantity,
          sellPrice: values.price,
          fee: values.fee,
          txDate: values.txDate,
          memo: values.memo.trim() || null,
        });
        soldOut = res.body.data === null;
        notifications.show({
          title: t("sell_done_title"),
          message: soldOut
            ? t("sell_done_soldout_msg")
            : t("sell_done_msg"),
          color: "blue",
        });
      }
      onSuccess?.(soldOut);
    } catch (error) {
      notifications.show({
        title: isEdit ? t("edit_fail_title") : t("record_fail_title"),
        message: getErrorMessage(error, te),
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = () => {
    if (!editingTx) return;
    modals.openConfirmModal({
      centered: true,
      title: t("delete_title"),
      labels: { confirm: tg("common.delete"), cancel: tg("common.cancel") },
      confirmProps: { color: "red" },
      children: (
        <span>
          {t("delete_confirm_msg")}
          <br />
          {t("delete_recalc_msg")}
        </span>
      ),
      onConfirm: async () => {
        setSubmitting(true);
        try {
          await removeTxMutation.mutateAsync(editingTx.txId);
          notifications.show({
            title: t("delete_done_title"),
            message: t("delete_done_msg"),
            color: "green",
          });
          onSuccess?.();
        } catch (error) {
          notifications.show({
            title: t("delete_fail_title"),
            message: getErrorMessage(error, te),
            color: "red",
          });
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  // Mantine NumberInput 은 편집 중 값을 문자열("0500")로 준다. 곱셈은 숫자로
  // 강제되지만 덧셈은 문자열 연결이 되므로("10000"+"500"→"10000500") 반드시 Number 로 캐스팅한다.
  const num = (v: number | string) => Number(v) || 0;
  const total = num(form.values.quantity) * num(form.values.price);
  const fee = num(form.values.fee);
  const isBuy = form.values.tradeType === "BUY";
  // 정산금액 — 매수는 수수료만큼 더 나가고, 매도는 그만큼 덜 들어온다.
  const settlement = isBuy ? total + fee : total - fee;
  const isPending =
    submitting ||
    buyMutation.isPending ||
    sellMutation.isPending ||
    updateTxMutation.isPending ||
    removeTxMutation.isPending;

  // 인풋 오른쪽 단위 — 거래 폼 금액과 같은 dim 13 (Figma 61:115)
  const unit = (label: string) => (
    <Text c="dimmed" fw={500} style={{ fontSize: 13, lineHeight: "19px" }}>
      {label}
    </Text>
  );
  // 화면만 빈칸 + placeholder "0"(상태 0 을 지우고 입력하지 않게). 빈 칸만 0 으로 되돌리고
  // "1." · "0.0" 같은 입력 중 문자열은 그대로 둔다 — 숫자로 막으면 소수 수량을 칠 수 없다(배치3 S6 B-1). 제출 직전 숫자화
  const numProps = (field: "quantity" | "price" | "fee") => {
    const input = form.getInputProps(field);
    return {
      ...input,
      value: form.values[field] || "",
      onChange: (v: number | string) => input.onChange(v === "" ? 0 : v),
      placeholder: "0",
    min: 0,
      thousandSeparator: ",",
      rightSectionPointerEvents: "none" as const,
    };
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap={14}>
        <SegmentedControl
          {...form.getInputProps("tradeType")}
          fullWidth
          aria-label={t("trade_type_label")}
          // 인디케이터는 흰 표면(테마) — color 로 채우면 활성 라벨이 흰색이 돼 사라진다.
          // 대신 라벨 글자에 매수=up · 매도=down 색 (DESIGN.md §2-3)
          data={ptTypeData.body.data.map((v) => ({
            value: v,
            label: (
              <Text component="span" inherit fw={700} style={{ color: semanticColor(v === "BUY" ? "up" : "down") }}>
                {tPt(v)}
              </Text>
            ),
          }))}
          disabled={isEdit}
        />
        {/* 2열 — 수량·단가 / 수수료·날짜 (Figma 61:115). 설명은 인풋 아래라 두 열 인풋 높이가 맞는다 */}
        <SimpleGrid cols={2} spacing={12}>
          <NumberInput
            {...numProps("quantity")}
            label={t("quantity")}
            decimalScale={4}
            rightSection={unit(t("unit_share"))}
            data-autofocus={isEdit ? undefined : true}
          />
          <NumberInput
            {...numProps("price")}
            label={isBuy ? t("label_buy_price") : t("label_sell_price")}
            rightSection={unit(tg("won"))}
          />
        </SimpleGrid>
        <SimpleGrid cols={2} spacing={12}>
          <NumberInput
            {...numProps("fee")}
            label={t("label_fee")}
            description={isBuy ? t("fee_buy_hint") : t("fee_sell_hint")}
            inputWrapperOrder={["label", "input", "description", "error"]}
            rightSection={unit(tg("won"))}
          />
          <DateInput
            value={form.values.txDate || null}
            onChange={(value) => form.setFieldValue("txDate", value ?? "")}
            error={form.errors.txDate}
            label={t("label_tx_date")}
            placeholder="YYYY.MM.DD"
            valueFormat="YYYY.MM.DD"
          />
        </SimpleGrid>
        <Textarea
          {...form.getInputProps("memo")}
          label={t("label_memo")}
          placeholder={t("memo_placeholder")}
          autosize
          minRows={1}
        />

        {/* 거래금액 / 수수료 / 정산금액 — 증권사 거래내역과 같은 3줄. hair-2 위.
            정산금액이 실제로 계좌를 드나드는 돈이라 굵게 강조한다. */}
        <Stack gap={0} pt={8} style={{ borderTop: "1px solid var(--moeum-hair-2)" }}>
          <SummaryRow label={isBuy ? t("buy_amount") : t("sell_amount")} value={`${fmt(total)}${tg("won")}`} />
          <SummaryRow label={t("label_fee")} value={`${fee === 0 ? "" : isBuy ? "+" : "−"}${fmt(fee)}${tg("won")}`} />
          <SummaryRow label={t("settlement_amount")} value={`${fmt(settlement)}${tg("won")}`} total />
        </Stack>

        {/* 기록 버튼은 accent — 매수/매도 색은 세그먼트 글자에만 (배치2 H-4, DESIGN §5 버튼) */}
        <FormActions
          submitLabel={
            isEdit ? tg("common.update") : isBuy ? t("buy_record") : t("sell_record")
          }
          isPending={isPending}
          onCancel={onCancel}
          cancelLabel={tg("common.cancel")}
          onRemove={isEdit ? handleRemove : undefined}
          removeLabel={tg("common.delete")}
          sticky
        />
      </Stack>
    </form>
  );
}

/** 정산 요약 한 줄 — 라벨 13 dim / 값 모노 13 (합계는 본문색 700 · 값 15) */
function SummaryRow({ label, value, total = false }: { label: string; value: string; total?: boolean }) {
  return (
    <Group justify="space-between" h={26} wrap="nowrap">
      <Text fz={13} lh="19px" fw={total ? 700 : 500} c={total ? undefined : "dimmed"}>
        {label}
      </Text>
      <Text className="moeum-mono" fz={total ? 15 : 13} fw={total ? 700 : 600}>
        {value}
      </Text>
    </Group>
  );
}
