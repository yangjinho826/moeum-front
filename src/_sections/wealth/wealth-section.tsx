"use client";

import { Box, Stack, Text, UnstyledButton } from "@mantine/core";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";

import AssetForm from "_features/account/components/asset-form";
import { useAccountSheetStore } from "_features/account/store";
import type { AccountListItemType } from "_features/account/types";
import CompositionBar from "_features/common/components/composition-bar";
import EmptyText from "_features/common/components/empty-text";
import FormSheet from "_features/common/components/form-sheet";
import ListRow from "_features/common/components/list-row";
import PageTitle from "_features/common/components/page-title";
import Section from "_features/common/components/section";
import type { AssetClass } from "_features/portfolio/types";
import { queryKeys } from "_constants/queries";
import { chartColor, type SemanticColor } from "_styles/semantic-color";
import { fmt } from "_utilities/fmt";

import AllocationTrendChart from "./components/allocation-trend-chart";

/**
 * 자산 상세(/wealth) — 명세서 배치 (plan/2.md, Figma 46:195).
 * 모바일: 자산 PageTitle(+ 자산 추가) → 자산 구성(구성 막대 + 행) → 배분 추이(적층 영역 12개월)
 * → 자산(수동자산: 부동산·연금·금·적금) → 통장. 데스크톱: 좌 판면(추이·통장) + 우 레일(구성·자산).
 * 색은 자산 구성의 현재 비중 순위(chart-1..5) 하나로 막대·행·추이를 맞춘다(홈 자산 구성과 같은 규칙).
 */
export default function WealthSection() {
  const { locale } = useParams<{ locale: string }>();
  const tType = useTranslations("enum.account-type");
  const tAssetClass = useTranslations("enum.asset-class");
  const tAsset = useTranslations("account.asset");
  const tWealth = useTranslations("wealth");
  const tHome = useTranslations("home");
  const tPortfolio = useTranslations("portfolio");
  const tg = useTranslations("general.common");

  const openAccountSheet = useAccountSheetStore((s) => s.open);

  const { data: overviewRes } = useSuspenseQuery(queryKeys.wealth.overview({}));

  // 수동자산 폼 시트 — 트리 안에서 직접 렌더해야 useQuery/useMutation 컨텍스트가 잡힘
  const [assetFormOpen, setAssetFormOpen] = useState(false);
  const [assetEdit, setAssetEdit] = useState<AccountListItemType | undefined>(undefined);

  const overview = overviewRes.body.data;
  const accounts: AccountListItemType[] = overview.accounts;
  // 수동자산 전용계좌(부동산·연금·금·적금)는 자산 섹션에서, 나머지는 통장 섹션에서
  const manualAssets = accounts.filter((a) => a.isManualAsset);
  const visibleAccounts = accounts.filter((a) => !a.isManualAsset);

  // 자산 구성 — 현재 비중 큰 순. 순위 = 차트 색(막대·행·추이 공통)
  const allocation = overview.allocation.currentAllocation
    .filter((s) => s.valuation > 0)
    .sort((a, b) => b.valuation - a.valuation);
  const order: AssetClass[] = allocation.map((s) => s.assetClass);
  const colorOf = (c: AssetClass): SemanticColor => {
    const i = order.indexOf(c);
    return i >= 0 ? chartColor(i) : "chart5";
  };
  const trend = overview.allocation.allocationTrend;

  const openAssetForm = (asset?: AccountListItemType) => {
    setAssetEdit(asset);
    setAssetFormOpen(true);
  };

  const addLinkStyle = {
    fontSize: 13,
    lineHeight: "19px",
    fontWeight: 700,
    color: "var(--moeum-accent)",
    padding: "8px 0 8px 12px",
    margin: "-8px 0",
  } as const;

  const compositionSection = allocation.length > 0 && (
    <Section title={tHome("asset_allocation")} hairline={false}>
      <CompositionBar
        segments={allocation.map((s) => ({ key: s.assetClass, ratio: s.ratio / 100, color: colorOf(s.assetClass) }))}
      />
      {allocation.map((s, i) => (
        <ListRow
          key={s.assetClass}
          titleDot={colorOf(s.assetClass)}
          title={tAssetClass(s.assetClass)}
          value={fmt(s.valuation)}
          sub={`${Math.round(s.ratio)}%`}
          last={i === allocation.length - 1}
        />
      ))}
    </Section>
  );

  const assetsSection = (
    <Section title={tAsset("section_title")} link={{ label: `+ ${tg("create")}`, onClick: () => openAssetForm() }}>
      {manualAssets.length === 0 ? (
        <EmptyText message={tAsset("empty")} action={{ label: tWealth("add_asset"), onClick: () => openAssetForm() }} />
      ) : (
        manualAssets.map((a, i) => (
          <ListRow
            key={a.accountId}
            tall
            chevron
            title={a.name}
            meta={tType(a.accountType)}
            value={fmt(a.balance)}
            last={i === manualAssets.length - 1}
            onClick={() => openAssetForm(a)}
          />
        ))
      )}
    </Section>
  );

  return (
    <div className="moeum-main-rail">
      <Stack gap={0}>
        <PageTitle title={tWealth("title")}>
          <UnstyledButton onClick={() => openAssetForm()} style={addLinkStyle}>
            + {tWealth("add_asset")}
          </UnstyledButton>
        </PageTitle>

        <Box hiddenFrom="lg">{compositionSection}</Box>

        {trend.length > 1 && (
          <Section
            title={tWealth("allocation_trend")}
            right={
              <Text
                className="moeum-mono"
                fw={600}
                c="dimmed"
                style={{ fontSize: 11, lineHeight: "16px", letterSpacing: "0.06em" }}
              >
                {tPortfolio("recent_months", { count: trend.length })}
              </Text>
            }
          >
            <AllocationTrendChart data={trend} colorOf={colorOf} order={order} />
          </Section>
        )}

        <Box hiddenFrom="lg">{assetsSection}</Box>

        <Section
          title={tWealth("accounts")}
          link={{ label: `+ ${tWealth("add_account")}`, onClick: () => openAccountSheet() }}
        >
          {visibleAccounts.map((a, i) => {
            const isInvest = a.accountType === "INVESTMENT";
            const meta =
              isInvest && a.cash != null
                ? `${tType(a.accountType)} · ${tPortfolio("cash_label")} ${fmt(a.cash)}`
                : tType(a.accountType);
            return (
              <ListRow
                key={a.accountId}
                tall
                chevron
                title={a.name}
                meta={meta}
                value={fmt(a.balance)}
                valueColor={a.balance < 0 ? "expense" : "text"}
                last={i === visibleAccounts.length - 1}
                // INVESTMENT 는 포트폴리오 디테일로, 그 외는 일반 통장 디테일로
                href={`/${locale}${isInvest ? `/invest/account/${a.accountId}` : `/account/${a.accountId}`}`}
              />
            );
          })}
        </Section>
      </Stack>

      <Box visibleFrom="lg" pt={48}>
        {compositionSection}
        {assetsSection}
      </Box>

      <FormSheet
        opened={assetFormOpen}
        onClose={() => setAssetFormOpen(false)}
        title={
          assetEdit
            ? `${tAsset("section_title")} ${tg("update")}`
            : `${tAsset("section_title")} ${tg("create")}`
        }
      >
        <AssetForm account={assetEdit} onClose={() => setAssetFormOpen(false)} />
      </FormSheet>
    </div>
  );
}
