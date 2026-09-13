import { Suspense } from "react";

import SectionSkeleton from "_features/common/components/section-skeleton";
import MembersSection from "_sections/members/members-section";

export const dynamic = "force-dynamic";

export default function MembersPage({
  params,
}: {
  params: { householdId: string };
}) {
  return (
    <Suspense fallback={<SectionSkeleton rows={3} />}>
      <MembersSection householdId={params.householdId} />
    </Suspense>
  );
}
