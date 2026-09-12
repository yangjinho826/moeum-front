"use client";

import { notifications } from "@mantine/notifications";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMessages } from "next-intl";
import { useEffect, useState, type ReactNode } from "react";

import { ApiResponseError } from "_libraries/fetch/api-response-error";

// 모듈 전역 객체 — useMessages hook 결과를 MutationCache.onError 가 참조하기 위함.
// 'use client' 보장하에 SSR 격리 문제 없음. 재할당 대신 내부 값 갱신.
const errorMessageStore: { messages: Record<string, string> } = { messages: {} };

function showApiErrorToast(error: unknown) {
  if (!(error instanceof ApiResponseError)) return;
  // 'reject' / 'component' 는 컴포넌트에서 직접 처리 — 자동 토스트 X
  if (error.errorHandleMethod !== "toast") return;

  const em = errorMessageStore.messages;
  const message =
    (error.errorCode && em[error.errorCode]) ||
    error.errorMessage ||
    em.unknown ||
    em.default ||
    em.fallback_generic ||
    "";

  notifications.show({
    message,
    color: "danger",
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const messages = useMessages() as { error?: Record<string, string> };

  // locale 변경 또는 messages 갱신 시 캐시 업데이트
  // (첫 마운트 직후 mutation 토스트가 빈 메시지 보여줄 가능성 미미하지만 허용)
  useEffect(() => {
    errorMessageStore.messages = messages.error ?? {};
  }, [messages]);

  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // 401/403 등 인증 에러는 retry 무의미 — 즉시 stop
              if (error instanceof ApiResponseError) {
                if (error.status === 401 || error.status === 403) return false;
              }
              // 그 외 에러는 1회만 retry (default 3회는 부담)
              return failureCount < 1;
            },
          },
        },
        // 모든 mutation 실패 시 글로벌 처리 — errorHandleMethod='toast' 만 자동 토스트
        mutationCache: new MutationCache({
          onError: (error) => showApiErrorToast(error),
        }),
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
