import { Suspense } from "react";

import SectionSkeleton from "_features/common/components/section-skeleton";
import CategorySection from "_sections/category/category-section";

export const dynamic = "force-dynamic";

export default function CategoryPage() {
  return (
    <Suspense fallback={<SectionSkeleton rows={6} />}>
      <CategorySection />
    </Suspense>
  );
}
