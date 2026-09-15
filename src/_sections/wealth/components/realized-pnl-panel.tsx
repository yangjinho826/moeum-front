"use client";

import { Card, Group, Stack, Text } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useTranslations } from "next-intl";
import { useDeferredValue, useState } from "react";

import FormSheet from "_features/common/components/form-sheet";
import { useMoney } from "_features/common/hooks/use-money";
import TradeForm from "_features/portfolio/components/trade-form";
import {
  useAccountRealizedPnl,
  useItemRealizedPnl,
} from "_features/portfolio/queries/use-query";
import type {
  PortfolioTransactionItemType,
  RealizedPnlResponseType,
  RealizedPnlRowType,
} from "_features/portfolio/types";
import {
  formatProfitAmount,
  formatProfitRate,
  profitColor,
} from "_features/portfolio/utils";
import { firstDayOfYearKst, todayIsoKst } from "_utilities/datetime";

interface Props {
  // 둘 중 하나 — 종목 단위(portfolioId) 또는 계좌 누적(accountId)
  portfolioId?: string;
  accountId?: string;
}

// 기간 — 기본은 **올해 1/1~오늘**(레일 숫자와 같게), 날짜로 직접 좁히거나 넓힌다.
// 프리셋(전체/올해/작년)은 두지 않는다.
interface Range {
  from: string;
  to: string;
}

/**
 * 매매손익 행 → 매매 폼이 받는 거래 형태로 변환.
 *
 * 폼은 ptType/quantity/price/fee/txDate/memo/txId 만 쓰므로 나머지는 표시용
 * 자리만 채운다. 매도 행이라 ptType 은 항상 SELL.
 */
function toEditingTx(row: RealizedPnlRowType): PortfolioTransactionItemType {
  return {
    txId: row.txId,
    accountId: "",
    accountName: "",
    name: row.name ?? "",
    code: row.code,
    market: row.market,
    ptType: "SELL",
    quantity: row.quantity,
    price: row.sellPrice,
    total: row.amount,
    fee: row.fee,
    settlementAmount: row.settlement,
    txDate: row.txDate,
    memo: row.memo,
    realizedPnl: row.realizedPnl,
  };
}

// 종목/계좌 useSuspenseQuery 는 조건부 호출 불가 → fetch 를 분리하고 뷰만 공유
export default function RealizedPnlPanel({ portfolioId, accountId }: Props) {
  if (portfolioId) return <ItemRealizedPnl portfolioId={portfolioId} />;
  if (accountId) return <AccountRealizedPnl accountId={accountId} />;
  return null;
}

function usePeriod() {
  // 기본 = 올해 1/1~오늘. 작년 이전은 시작일을 직접 넓힌다.
  const [range, setRange] = useState<Range>(() => ({
    from: firstDayOfYearKst(),
    to: todayIsoKst(),
  }));
  // 쿼리는 지연값으로 — 날짜 변경 시 재-suspend 로 Drawer 가 깜빡이지 않게
  const deferredRange = useDeferredValue(range);
  return {
    range: deferredRange,
    draft: range,
    setRange,
    isStale: range !== deferredRange,
  };
}

function ItemRealizedPnl({ portfolioId }: { portfolioId: string }) {
  const p = usePeriod();
  const { data } = useItemRealizedPnl(portfolioId, p.range.from, p.range.to);
  return <RealizedPnlView data={data.body.data} period={p} />;
}

function AccountRealizedPnl({ accountId }: { accountId: string }) {
  const p = usePeriod();
  const { data } = useAccountRealizedPnl(accountId, p.range.from, p.range.to);
  return <RealizedPnlView data={data.body.data} period={p} />;
}

interface ViewProps {
  data: RealizedPnlResponseType;
  period: ReturnType<typeof usePeriod>;
}

function RealizedPnlView({ data, period }: ViewProps) {
  const t = useTranslations("portfolio");
  const tGeneral = useTranslations("general");
  const money = useMoney();
  const { summary, rows } = data;
  const [editing, setEditing] = useState<RealizedPnlRowType | null>(null);

  return (
    <Stack gap="sm">
      {/* 기간 — 날짜 두 개로만 바꾼다. 기본은 올해 1/1~오늘. */}
      <Group grow gap="xs">
        <DatePickerInput
          size="xs"
          valueFormat="YYYY-MM-DD"
          label={t("period_from")}
          value={period.draft.from}
          maxDate={period.draft.to}
          onChange={(v) =>
            v && period.setRange((r) => ({ ...r, from: v }))
          }
        />
        <DatePickerInput
          size="xs"
          valueFormat="YYYY-MM-DD"
          label={t("period_to")}
          value={period.draft.to}
          minDate={period.draft.from}
          onChange={(v) => v && period.setRange((r) => ({ ...r, to: v }))}
        />
      </Group>

      {/* 지연 로딩 중 살짝 흐리게 — 깜빡임 대신 부드러운 전환 */}
      <Stack
        gap="sm"
        style={{
          opacity: period.isStale ? 0.5 : 1,
          transition: "opacity 0.15s ease",
        }}
      >
        {/* 요약 — 증권사 매매손익 헤더. sell/buy 는 gross, 실현손익은 net 이라
            제비용을 따로 보여줘야 숫자가 읽힌다. */}
        <Card radius="lg" p="md">
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {t("realized_pnl")}
              </Text>
              <Group gap={6}>
                <Text
                  size="sm"
                  fw={800}
                  c={profitColor(summary.totalRealized)}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {formatProfitAmount(summary.totalRealized, money)}
                </Text>
                <Text
                  size="sm"
                  fw={700}
                  c={profitColor(summary.totalRate)}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {formatProfitRate(summary.totalRate)}
                </Text>
              </Group>
            </Group>
            <SummaryLine label={t("sell_amount")} value={money(summary.sellAmount)} />
            <SummaryLine label={t("buy_amount")} value={money(summary.buyAmount)} />
            <SummaryLine label={t("total_fee")} value={money(summary.totalFee)} />
            <Text size="10px" c="dimmed">
              {data.effectiveFrom} ~ {data.effectiveTo}
            </Text>
          </Stack>
        </Card>

        {/* 매도 건별 — 증권사 거래내역 카드. 탭하면 그 매도를 수정한다
            (전량매도로 종목이 사라져도 여기서는 접근할 수 있다). */}
        <Stack gap="xs">
          <Text size="sm" fw={700}>
            {t("sell_history")} ({rows.length})
          </Text>
          {rows.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="md">
              {t("no_sell_history")}
            </Text>
          ) : (
            rows.map((r) => (
              <SellCard
                key={r.txId}
                row={r}
                onEdit={() => setEditing(r)}
                money={money}
                t={t}
                tGeneral={tGeneral}
              />
            ))
          )}
        </Stack>
      </Stack>

      <FormSheet
        opened={editing !== null}
        onClose={() => setEditing(null)}
        title={t("edit_trade")}
      >
        {editing?.portfolioItemId && (
          <TradeForm
            portfolioId={editing.portfolioItemId}
            editingTx={toEditingTx(editing)}
            onSuccess={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        )}
      </FormSheet>
    </Stack>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="xs" fw={600} style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </Text>
    </Group>
  );
}

interface SellCardProps {
  row: RealizedPnlRowType;
  onEdit: () => void;
  money: (v: number) => string;
  t: ReturnType<typeof useTranslations>;
  tGeneral: ReturnType<typeof useTranslations>;
}

/**
 * 매도 1건 카드 — 증권사 거래내역과 같은 좌우 2열 구성.
 * 거래일자/거래수량/수수료 는 왼쪽, 거래금액/거래단가/정산금액 은 오른쪽.
 */
function SellCard({ row, onEdit, money, t, tGeneral }: SellCardProps) {
  return (
    <Card
      radius="lg"
      p="md"
      onClick={onEdit}
      style={{ cursor: "pointer" }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onEdit();
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="baseline" wrap="nowrap">
          <Text size="sm" fw={800} c="info.6">
            {t("sell_record")}
          </Text>
          {row.name && (
            <Text size="sm" fw={700} truncate>
              {row.name}
            </Text>
          )}
        </Group>

        <Group align="flex-start" gap="md" grow>
          <Stack gap={2}>
            <Field label={t("label_tx_date")} value={row.txDate} />
            <Field
              label={t("quantity")}
              value={tGeneral("unit.stock", { count: row.quantity })}
            />
            <Field label={t("label_fee")} value={money(row.fee)} />
          </Stack>
          <Stack gap={2}>
            <Field label={t("sell_amount")} value={money(row.amount)} />
            <Field label={t("label_sell_price")} value={money(row.sellPrice)} />
            <Field
              label={t("settlement_amount")}
              value={money(row.settlement)}
              strong
            />
          </Stack>
        </Group>

        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            {t("realized_pnl")}
          </Text>
          <Group gap={6}>
            <Text
              size="sm"
              fw={800}
              c={profitColor(row.realizedPnl)}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatProfitAmount(row.realizedPnl, money)}
            </Text>
            <Text
              size="xs"
              fw={700}
              c={profitColor(row.realizedRate)}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatProfitRate(row.realizedRate)}
            </Text>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}

function Field({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <Group justify="space-between" gap="xs" wrap="nowrap">
      <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
        · {label}
      </Text>
      <Text
        size="xs"
        fw={strong ? 800 : 600}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </Text>
    </Group>
  );
}
