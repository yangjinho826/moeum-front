import { Suspense } from "react";

import SectionSkeleton from "_features/common/components/section-skeleton";
import HouseholdSection from "_sections/household/household-section";

export const dynamic = "force-dynamic";

export default function HouseholdPage() {
  return (
    <Suspense fallback={<SectionSkeleton rows={3} />}>
      <HouseholdSection />
    </Suspense>
  );
}
