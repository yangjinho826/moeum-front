"use client";

import { useDisclosure } from "@mantine/hooks";
import { useTranslations } from "next-intl";

import FormSheet from "_features/common/components/form-sheet";
import ListRow from "_features/common/components/list-row";
import RealizedPnlPanel from "_sections/wealth/components/realized-pnl-panel";
import { useAccountRealizedPnlThisYear } from "_features/portfolio/queries/use-query";
import { signColor } from "_styles/semantic-color";
import { nowKst } from "_utilities/datetime";
import { fmtSigned, fmtSignedPct } from "_utilities/fmt";

interface Props {
  accountId: string;
}

/**
 * 올해 매매수익 레일 — 종목비중 도넛 아래 얇은 카드.
 * "도넛=지금 보유 / 레일=팔고 지나간 성과" 대비. 대표값은 올해 1/1~오늘(해가 바뀌면 새로 시작),
 * 탭하면 바텀시트에서 같은 기간으로 열리고 날짜를 자유롭게 바꿔 매도내역을 본다.
 * 전량매도로 사라진 종목 성과까지 집계됨. 매도 이력이 아예 없으면 레일 숨김 —
 * 올해만 0건이면 0 으로 남긴다(지난 매도 수정 입구가 이 시트뿐이라).
 */
export default function RealizedPnlRail({ accountId }: Props) {
  const t = useTranslations("portfolio");
  const [opened, { open, close }] = useDisclosure(false);
  const { all, thisYear } = useAccountRealizedPnlThisYear(accountId);
  const { summary, rows } = thisYear;

  if (all.rows.length === 0) return null;

  return (
    <>
      {/* 얇은 행 하나 — 카드 없음(QA D-1). 탭하면 시트 */}
      <ListRow
        tall
        chevron
        last
        title={t("year_realized", { year: nowKst().year() })}
        meta={`${t("since_jan1")} · ${t("sell_count", { count: rows.length })}`}
        value={fmtSigned(summary.totalRealized)}
        valueColor={signColor(summary.totalRealized, "asset")}
        sub={fmtSignedPct(summary.totalRate)}
        subColor={signColor(summary.totalRate, "asset")}
        onClick={open}
      />

      <FormSheet
        opened={opened}
        onClose={close}
        title={t("realized_gains")}
      >
        <RealizedPnlPanel accountId={accountId} />
      </FormSheet>
    </>
  );
}
