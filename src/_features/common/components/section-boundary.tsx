"use client";

import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Component, Suspense, type ReactNode } from "react";

import EmptyText from "./empty-text";
import Section from "./section";
import SectionSkeleton from "./section-skeleton";

interface CatcherProps {
  resetKey?: unknown;
  onReset: () => void;
  fallback: (retry: () => void) => ReactNode;
  children: ReactNode;
}

/** 렌더 중 throw 를 잡는 최소 경계 — 에러 경계는 클래스 컴포넌트로만 만들 수 있다 */
class ErrorCatcher extends Component<CatcherProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  retry = () => {
    this.props.onReset();
    this.setState({ failed: false });
  };

  // 조회 조건(선택 월 등)이 바뀌면 실패를 풀고 새 조건으로 다시 그린다 — 한 달 실패가 다른 달까지 막지 않게
  componentDidUpdate(prev: CatcherProps) {
    if (this.state.failed && prev.resetKey !== this.props.resetKey) this.retry();
  }

  render() {
    return this.state.failed ? this.props.fallback(this.retry) : this.props.children;
  }
}

interface SectionBoundaryProps {
  /** 실패 시에도 섹션 제목을 남겨 어느 영역이 비었는지 보이게 */
  title?: string;
  /** 로딩 자리표시. 기본 = 행 1개 스켈레톤 */
  loading?: ReactNode;
  /** 바뀌면 실패 상태를 초기화(예: 선택 월) */
  resetKey?: unknown;
  children: ReactNode;
}

/**
 * 보조 섹션(추이·누적 매매수익 등) 경계 — 로딩은 스켈레톤, 실패는 섹션 안 "불러오지 못했어요 · 다시 시도"
 * (plan/2.md 에러 상태). 한 섹션 조회 실패가 (user)/error.tsx 로 화면 전체를 갈아치우지 않게 한다.
 * 화면의 주 쿼리(hero 데이터)는 감싸지 않는다 — 그건 화면 에러(재시도 포함)가 맞다.
 */
export default function SectionBoundary({ title, loading, resetKey, children }: SectionBoundaryProps) {
  const t = useTranslations("general.common");
  const te = useTranslations("error");

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorCatcher
          resetKey={resetKey}
          onReset={reset}
          fallback={(retry) => {
            const message = (
              <EmptyText message={t("load_failed")} action={{ label: te("fallback_retry"), onClick: retry }} />
            );
            return title ? <Section title={title}>{message}</Section> : message;
          }}
        >
          <Suspense fallback={loading ?? <SectionSkeleton rows={1} />}>{children}</Suspense>
        </ErrorCatcher>
      )}
    </QueryErrorResetBoundary>
  );
}
