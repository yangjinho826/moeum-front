import { Suspense } from "react";

import SectionSkeleton from "_features/common/components/section-skeleton";
import PortfolioTradeSection from "_sections/wealth/portfolio-trade-section";

export default function WealthPortfolioDetailPage({
  params,
}: {
  params: { portfolioId: string };
}) {
  return (
    <Suspense fallback={<SectionSkeleton hero rows={3} />}>
      <PortfolioTradeSection portfolioId={params.portfolioId} />
    </Suspense>
  );
}
