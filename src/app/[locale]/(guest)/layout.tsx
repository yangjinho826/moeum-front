import { Container } from "@mantine/core";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { hasRefreshCookie } from "_libraries/auth/guard";

export default async function GuestLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  if (await hasRefreshCookie()) {
    redirect(`/${params.locale}`);
  }

  return (
    // 게스트(로그인·가입) — 배경은 앱과 같은 bg 단색(그라데이션·카드 없음, DESIGN §1). 칼럼 448 · 좌우 20
    <Container size={448} px={20} pt={{ base: 64, lg: 120 }} pb={40} mih="100dvh">
      {children}
    </Container>
  );
}
