import { redirect } from "next/navigation";

// 통장 목록은 자산 화면의 "통장" 섹션과 같아 따로 두지 않는다 (배치3 S3 결정 — 들어오는 링크 0)
export default function AccountPage({
  params,
}: {
  params: { locale: string };
}) {
  redirect(`/${params.locale}/wealth`);
}
