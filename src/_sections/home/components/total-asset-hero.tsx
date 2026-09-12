"use client";

import { Text, UnstyledButton } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useAccountSnapshotMutations } from "_features/account-snapshot/queries/use-mutations";
import DeltaPill from "_features/common/components/delta-pill";
import FormSheet from "_features/common/components/form-sheet";
import HeroAmount from "_features/common/components/hero-amount";
import Sparkline from "_features/common/components/sparkline";
import { useMonthLabel } from "_features/common/hooks/use-month-label";
import { queryKeys } from "_constants/queries";
import { getErrorMessage } from "_libraries/fetch/error-message";
import { todayIsoKst } from "_utilities/datetime";

import SnapshotDrilldownPanel from "_sections/wealth/components/snapshot-drilldown-panel";

/**
 * TotalAssetHero — 홈 상단 결과 하나 (DESIGN.md §5 HeroAmount, Figma 12:6 + Sparkline 12:14).
 *
 * `기준일 · [N월 기록]` 캡션(링크 = 지난달 박제 confirm) → 총자산 44/60 → DeltaPill(마지막 박제 대비)
 * → 44px 추이선(점 탭 = 그달 분해 FormSheet). wealth.overview 단독 소비(홈 다른 쿼리와 캐시 공유).
 */
export default function TotalAssetHero() {
  const t = useTranslations("home");
  const tCommon = useTranslations("general.common");
  const te = useTranslations("error");
  const monthLabel = useMonthLabel();

  const { data: overviewRes } = useSuspenseQuery(queryKeys.wealth.overview({}));
  const { createMutation } = useAccountSnapshotMutations();

  // 추이에서 탭한 월 — 그달 계좌별 분해 패널
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  // 프라이버시 — 금액 blur
  const [hidden, setHidden] = useState(true);

  const overview = overviewRes.body.data;
  const yearly = overview.yearlySnapshots;
  const total = overview.totalBalance;
  const months = yearly.months;

  const selectedMonth = selectedIdx !== null ? (months[selectedIdx] ?? null) : null;

  // 추이 = 박제 월들 + 현재점. 현재점은 드릴다운 대상 아님(인덱스 범위로 걸러냄)
  const trend = months.map((m) => m.totalBalance);
  if (months.length > 0) trend.push(total);

  // 마지막 박제 대비 증감
  const lastSnapshot = months.length > 0 ? months[months.length - 1] : null;
  const diff = lastSnapshot ? total - lastSnapshot.totalBalance : null;
  const diffPct =
    lastSnapshot && lastSnapshot.totalBalance > 0
      ? ((total - lastSnapshot.totalBalance) / lastSnapshot.totalBalance) * 100
      : null;

  // 지난달 박제(targetMonth) upsert — 캡션 링크에서 열림
  const isTargetSaved = yearly.targetMonthSaved;
  const targetMonthLabel = monthLabel(yearly.targetMonthDate);
  const asOf = todayIsoKst().replace(/-/g, ".");

  const handleTakeSnapshot = () => {
    if (createMutation.isPending) return;
    modals.openConfirmModal({
      centered: true,
      title: t("snapshot_title", { month: targetMonthLabel }),
      labels: {
        confirm: isTargetSaved ? t("snapshot_overwrite") : t("snapshot_save"),
        cancel: tCommon("cancel"),
      },
      children: (
        <Text size="sm">
          {isTargetSaved
            ? t("snapshot_body_overwrite", { month: targetMonthLabel })
            : t("snapshot_body_new", { month: targetMonthLabel })}
          <br />
          {t("snapshot_body_note")}
        </Text>
      ),
      onConfirm: async () => {
        try {
          await createMutation.mutateAsync();
          notifications.show({
            title: t("snapshot_done_title"),
            message: t("snapshot_done", { month: targetMonthLabel }),
            color: "positive",
          });
        } catch (error) {
          notifications.show({
            title: t("snapshot_fail_title"),
            message: getErrorMessage(error, te),
            color: "danger",
          });
        }
      },
    });
  };

  const snapshotLink = (
    <UnstyledButton
      onClick={handleTakeSnapshot}
      disabled={createMutation.isPending}
      className="moeum-mono"
      style={{
        fontSize: 11,
        lineHeight: "16px",
        fontWeight: 600,
        letterSpacing: "0.06em",
        color: "var(--moeum-accent)",
        opacity: createMutation.isPending ? 0.5 : 1,
        // 캡션 링크 히트영역 32px(위아래 8 패딩, 음수 마진으로 캡션 행 높이 유지)
        padding: "8px 4px",
        margin: "-8px -4px",
      }}
    >
      {isTargetSaved
        ? t("update_month", { month: targetMonthLabel })
        : t("record_month", { month: targetMonthLabel })}
    </UnstyledButton>
  );

  return (
    <>
      <HeroAmount
        caption={
          <>
            {t("as_of", { date: asOf })} · {snapshotLink}
          </>
        }
        label={t("total_asset")}
        amount={total}
        unit={t("won")}
        blurred={hidden}
        onToggleBlur={() => setHidden((v) => !v)}
      >
        {diff !== null && lastSnapshot ? (
          <DeltaPill
            value={diff}
            variant="asset"
            rate={diffPct}
            caption={t("diff_vs_record", {
              month: monthLabel(lastSnapshot.snapshotDate),
            })}
          />
        ) : (
          // 빈 상태 — 박제 0건이면 비교 대신 첫 기록 유도
          <Text c="dimmed" fw={500} pt={4} style={{ fontSize: 13, lineHeight: "19px" }}>
            {t("empty_snapshot")}{" "}
            <UnstyledButton
              onClick={handleTakeSnapshot}
              style={{ fontSize: 13, fontWeight: 600, color: "var(--moeum-accent)" }}
            >
              {t("record_now")}
            </UnstyledButton>
          </Text>
        )}
      </HeroAmount>

      <Sparkline
        values={trend}
        labels={[...months.map((m) => monthLabel(m.snapshotDate)), t("as_of", { date: asOf })]}
        className="moeum-spark"
        onPointClick={(idx) => {
          if (idx < months.length) {
            setSelectedIdx((cur) => (cur === idx ? null : idx));
          }
        }}
      />

      {/* 드릴다운 — 다른 화면과 동일한 바텀시트 패턴(FormSheet). BottomTab 보정 포함 */}
      <FormSheet
        opened={selectedMonth !== null}
        onClose={() => setSelectedIdx(null)}
        title={
          selectedMonth
            ? t("drilldown_title", { month: monthLabel(selectedMonth.snapshotDate) })
            : ""
        }
      >
        {selectedMonth && <SnapshotDrilldownPanel month={selectedMonth} />}
      </FormSheet>
    </>
  );
}
