# QA redesign-20260911 마감 — 2026-09-13 (배치1~7 전 화면)
토큰 신규 위반 0(baseline 88 유지) · typecheck 0 · lint 0 · `pnpm build` exit 0(프로덕션 서버로 로그인·홈·종목 추가 스모크 — 콘솔 에러 0, outline 비활성·워드마크 computed 확인) · 콘솔 에러 0(데스크톱 16경로 + 390 13화면 + 시트 6)
진행 = 사용자 "전체 총괄" 위임(배치5 S6 승인 · 배치6·7 pick 추천안 · 마감 · 배포).

## 전 화면 재촬영 (shots/)
| 화면 | 390 | 1440 | 비고 |
|---|---|---|---|
| home | home.jpg | home-desktop.jpg | 총자산 숨김 켜진 상태 그대로 |
| transactions | transactions.jpg | transactions-desktop.jpg | 9월 기록 없음 — 빈 상태 문구 |
| invest | invest.jpg | invest-desktop.jpg | |
| settings | settings.jpg | settings-desktop.jpg | 이메일 가림(me@example.com) |
| wealth | wealth.jpg | wealth-desktop.jpg | |
| invest/account/[id] | invest-account.jpg | invest-account-desktop.jpg | |
| invest/portfolio/[id] | invest-portfolio.jpg | invest-portfolio-desktop.jpg | |
| account/[id] | account-detail.jpg | account-detail-desktop.jpg | |
| category · /new · 시트 | category.jpg · category-sheet.jpg | category-desktop.jpg · category-new-desktop.jpg | |
| fixed · /new | fixed.jpg | fixed-desktop.jpg · fixed-new-desktop.jpg | |
| household · /new · /[id] | household.jpg | household-desktop.jpg · household-new-desktop.jpg · household-edit-desktop.jpg | |
| members · 전환기 | members-sheet.jpg · switcher-sheet.jpg · switcher-dark.jpg | members-desktop.jpg · switcher-desktop.jpg | 다크 1장(스킴 되돌림) |
| transactions/new · /[id] | transactions-new.jpg(시트) | transactions-new-desktop.jpg · transaction-edit-desktop.jpg | |
| invest/new · /[id] · 매매 | invest-new-sheet.jpg · trade-sheet.jpg | invest-new-desktop.jpg · invest-edit-desktop.jpg | |
| account/new | — | account-new-desktop.jpg | |
| login | login.jpg | login-desktop.jpg | 별도 헤드리스(로그아웃 X) |
| register · onboarding | ⏭ | ⏭ | 베타 차단 리다이렉트 · 가계부 0개 계정 필요 |
옛 shot 가운데 `crop390.sh` 가운데 자르기로 왼쪽이 잘렸던 것(배치5 시트 등)은 이번 재촬영(Chrome zoom 저장)으로 교체. 설정 화면 실제 이메일도 가림 버전으로 교체.

## 마감에서 고친 것
| # | 발견 | 수정 |
|---|---|---|
| Z-1 | 모바일 기록 버튼(FAB)이 /transactions/* 전체에 떠서 거래 추가·수정 페이지 메모 칸을 덮음 | 거래 목록 루트에서만(ecbf5ef) |
| Z-2 | 가계부 도움말 "멤버 초대" — 실제는 바로 추가 | "멤버 추가"(ecbf5ef, Figma 75:175) |
| Z-3 | 폼 삭제 확인이 종목만 danger | 5곳 통일(67e3401) |

## 남은 보류(배포 막지 않음)
- 배치5 H-501(수정에서 비우기 — 백엔드, 하지 않기로) · H-503~H-507
- 배치6 H-601(아이콘 선택기 칸 폭 38.5) · H-602(내보내기·멤버 시점 실데이터) · H-603 · H-604 · H-605(가입 재오픈)
- 배치7 H-701(현재가 0 수정) · H-702(온보딩 중 셸) · H-703(온보딩 렌더) · H-704
- 전역: `_styles/design-tokens.ts`(TOKEN · PORTFOLIO_PALETTE) · `account/constants.ts` 자산 유형 hex · `error-fallback.tsx` 아이콘 hex — baseline 88 안의 기존 것, 토큰 정리 배치에서

## 룰 구멍 메모
- i18n JSON 수정은 turbopack dev 서버에 반영이 안 될 때가 있다(동적 import 캐시) — 문구 확인 전 dev 서버 재시작.
- 390 shot 은 `sips --cropOffset` 대신 Chrome `zoom` 영역 저장.
