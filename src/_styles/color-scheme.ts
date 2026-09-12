import type { MantineColorScheme } from "@mantine/core";

/** 서버(base-layout)와 클라이언트(provider)가 같은 값을 봐야 새로고침 깜빡임이 없다 */
export const COLOR_SCHEME_STORAGE_KEY = "moeum-color-scheme";
export const DEFAULT_COLOR_SCHEME: MantineColorScheme = "light";
