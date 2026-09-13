/* eslint-disable @next/next/no-head-element */
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { MantineProviders } from "_providers/mantine-provider";
import { QueryProvider } from "_providers/query-provider";
import { SearchParamsProvider } from "_providers/search-params-provider";
import {
  COLOR_SCHEME_STORAGE_KEY,
  DEFAULT_COLOR_SCHEME,
} from "_styles/color-scheme";

/**
 * BaseLayout — `<html><body>` + 글로벌 Provider 통합.
 *
 * Provider 순서 (bims 동일):
 * NextIntl → Mantine(+Modals+Notifications) → ReactQuery → SearchParams(nuqs)
 *
 * 스킴: 라이트 기본 + 다크. `ColorSchemeScript` 가 localStorage 값을 첫 페인트 전에
 * <html data-mantine-color-scheme> 에 써서 새로고침 깜빡임이 없다 (DESIGN.md §7).
 */
export async function BaseLayout({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "app" });

  return (
    <html
      lang={locale}
      {...mantineHtmlProps}
      data-mantine-color-scheme={DEFAULT_COLOR_SCHEME}
    >
      <head>
        <ColorSchemeScript
          defaultColorScheme={DEFAULT_COLOR_SCHEME}
          localStorageKey={COLOR_SCHEME_STORAGE_KEY}
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        {/* 금액·날짜·라벨 전용 등폭 (Geist Mono) — 전역 1회 로드라 next/font 페이지 단위 권고 해당 없음 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&display=swap"
        />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#FAF6EF" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={t("meta_title")} />
        <link rel="manifest" href="/manifest.json" />
      </head>
      {/* body 배경(양옆 거터)은 globals.css 가 --moeum-surface-2 로. 박스 폭·bg 는 각 layout 책임. */}
      <body>
        <NextIntlClientProvider messages={messages}>
          <MantineProviders>
            <QueryProvider>
              <SearchParamsProvider>{children}</SearchParamsProvider>
            </QueryProvider>
          </MantineProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
