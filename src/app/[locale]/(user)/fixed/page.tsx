import { Suspense } from "react";

import SectionSkeleton from "_features/common/components/section-skeleton";
import FixedSection from "_sections/fixed/fixed-section";

export const dynamic = "force-dynamic";

export default function FixedPage() {
  return (
    <Suspense fallback={<SectionSkeleton hero rows={4} />}>
      <FixedSection />
    </Suspense>
  );
}
