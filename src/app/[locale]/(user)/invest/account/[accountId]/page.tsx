import { Suspense } from "react";

import SectionSkeleton from "_features/common/components/section-skeleton";
import AccountPortfolioSection from "_sections/wealth/account-portfolio-section";

export default function WealthAccountDetailPage({
  params,
}: {
  params: { accountId: string };
}) {
  return (
    <Suspense fallback={<SectionSkeleton hero rows={3} />}>
      <AccountPortfolioSection accountId={params.accountId} />
    </Suspense>
  );
}
