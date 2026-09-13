"use client";

import { useDisclosure } from "@mantine/hooks";
import { useTranslations } from "next-intl";

import FormSheet from "_features/common/components/form-sheet";
import ListRow from "_features/common/components/list-row";
import RealizedPnlPanel from "_sections/wealth/components/realized-pnl-panel";
import { useAccountRealizedPnl } from "_features/portfolio/queries/use-query";
import { signColor } from "_styles/semantic-color";
import { fmtSigned, fmtSignedPct } from "_utilities/fmt";

interface Props {
  accountId: string;
}

/**
 * 누적 매매수익 레일 — 종목비중 도넛 아래 얇은 카드.
 * "도넛=지금 보유 / 레일=팔고 지나간 성과" 대비. 대표값은 전체 매도기간(백엔드가
 * 첫 매도일~오늘로 잡음), 탭하면 바텀시트에서 날짜를 자유롭게 좁혀 매도내역을 본다.
 * 전량매도로 사라진 종목 성과까지 집계됨. 매도 이력 없으면 레일 숨김.
 */
export default function RealizedPnlRail({ accountId }: Props) {
  const t = useTranslations("portfolio");
  const [opened, { open, close }] = useDisclosure(false);
  // from/to 미전송 → 백엔드가 첫 매도일~오늘 전체로 집계. 시트도 동일 기본 범위.
  const { data } = useAccountRealizedPnl(accountId);
  const { summary, rows } = data.body.data;

  if (rows.length === 0) return null;

  return (
    <>
      {/* 얇은 행 하나 — 카드 없음(QA D-1). 탭하면 시트 */}
      <ListRow
        tall
        chevron
        last
        title={t("cumulative_realized")}
        meta={`${t("realized_all_period")} · ${t("sell_count", { count: rows.length })}`}
        value={fmtSigned(summary.totalRealized)}
        valueColor={signColor(summary.totalRealized, "asset")}
        sub={fmtSignedPct(summary.totalRate)}
        subColor={signColor(summary.totalRate, "asset")}
        onClick={open}
      />

      <FormSheet
        opened={opened}
        onClose={close}
        title={t("cumulative_realized")}
      >
        <RealizedPnlPanel accountId={accountId} />
      </FormSheet>
    </>
  );
}
