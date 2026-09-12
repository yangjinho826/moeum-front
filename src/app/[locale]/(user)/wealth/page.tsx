import { Suspense } from "react";

import SectionSkeleton from "_features/common/components/section-skeleton";
import WealthSection from "_sections/wealth/wealth-section";

export const dynamic = "force-dynamic";

export default function WealthPage() {
  return (
    <Suspense fallback={<SectionSkeleton hero rows={3} />}>
      <WealthSection />
    </Suspense>
  );
}
