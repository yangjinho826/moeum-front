"use client";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

import {
  localStorageColorSchemeManager,
  MantineProvider,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import type { PropsWithChildren } from "react";

import {
  COLOR_SCHEME_STORAGE_KEY,
  DEFAULT_COLOR_SCHEME,
} from "_styles/color-scheme";
import { moeumCssVariables } from "_styles/css-variables";
import { mantineTheme } from "_styles/mantineTheme";

// 모듈 스코프 — 렌더마다 매니저가 새로 만들어지면 구독이 끊긴다
const colorSchemeManager = localStorageColorSchemeManager({
  key: COLOR_SCHEME_STORAGE_KEY,
});

export function MantineProviders({ children }: PropsWithChildren) {
  return (
    <MantineProvider
      theme={mantineTheme}
      colorSchemeManager={colorSchemeManager}
      defaultColorScheme={DEFAULT_COLOR_SCHEME}
      cssVariablesResolver={moeumCssVariables}
    >
      <Notifications position="top-center" />
      <ModalsProvider>{children}</ModalsProvider>
    </MantineProvider>
  );
}
