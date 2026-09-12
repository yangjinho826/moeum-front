import { Suspense } from "react";

import SectionSkeleton from "_features/common/components/section-skeleton";
import AccountReportSection from "_sections/account/account-report-section";

export const dynamic = "force-dynamic";

export default function AccountDetailPage({
  params,
}: {
  params: { accountId: string };
}) {
  return (
    <Suspense fallback={<SectionSkeleton hero rows={3} />}>
      <AccountReportSection accountId={params.accountId} />
    </Suspense>
  );
}
