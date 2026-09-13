# 활성 컨텍스트

## Goal

**가계부 × 자산 통합 — 월별 자산변동 추적**.
"매월 내 자산이 어떻게 변하는지 한눈에" (총자산 기준, 부채/순자산 안 함).

현재 사이클: **R5b — 3트랙 (① 자산성격 제거 ② 디자인·브랜딩 ③ 수익률·목표)**. 로드맵 = `~/.claude/plans/tranquil-seeking-meadow.md`.
이전 사이클: R5a (자산성격 배분 + ManualAsset + 월별 배분추이) — 완료.

## Status

### 리디자인 Quiet Dark — 배치1~7 + 마감 완료 (2026-09-13, feat/redesign-quiet-dark)
design-flow run `redesign-20260911`(docs/design/…/status.md 가 정본). 사용자 "전체 총괄" 위임으로 배치5 S6 승인 → 배치6(멤버·전환기·로그인·가입) → 배치7(종목 폼·거래 수정·온보딩) → 마감(qa/final.md) → main 머지·v0.13.0 태그 배포.
- 공통 변경: FormSheet 본문 좌우 20 · 폼 아닌 시트 닫기 X · ListRow `action`/`current` · `BrandWordmark` · `isValidEmail`(백엔드 규칙) · outline 비활성 투명 · 삭제 확인 danger 통일 · FAB 목록 루트만.
- 팀에 확인: H-501(수정에서 비우기 = 백엔드, 하지 않기로) · H-601 아이콘 선택기 칸 폭 · H-701 현재가 0 수정 · 가입 재오픈 시 로그인 링크·온보딩 셸.
- 주의: i18n JSON 수정은 turbopack dev 에 안 먹을 때 있음 → 재시작. 390 shot 은 Chrome zoom 저장(sips cropOffset 은 가운데 자름). 공개 레포라 shot 이메일은 가림.

### 프로젝트 이름 정리 — `household` → `moeum` (2026-08-22, B·C 레이어만)
브랜드는 이미 "모음"인데 레포·디렉토리·문서에 옛 이름이 남아 거슬린다는 요청. 범위를 4레이어로 쪼개 **B(문서·주석)·C(디렉토리·레포명)만 실행**, D(인프라 식별자)·E(도메인 모델)는 보류.
- **C**: GitHub 레포 `household-front` → `moeum-front` + 로컬 디렉토리 rename. `deploy.yml`/`rollback.yml` 이 레포명이 아니라 GHCR 이미지명·서버 경로를 하드코딩하고 있어 배포 무영향(착수 전 실측).
- **B**: README·CLAUDE.md·`design/logo-20260603/README.md` 프로젝트명 표기 + `package.json` name (`private: true`, lockfile·코드 참조 0 → 안전).
- **경로 부수 정리**: `~/.claude/memory/moeum-front`, `~/.gstack/projects/yangjinho826-moeum-front` 로 이동하고 `.claude/settings*.json` 하드코딩 경로 갱신.
- **미치환(의도적)**: `docker-compose.yml`(`household-net`·`BACKEND_URL: http://household-back:8000`)·`nginx.conf`(`household.jinho826.com`)·`.env.local.example` = D. i18n `"가계부"`/`household` 키 = E(도메인).
- 코드 내 `household` 는 전부 도메인 개념(공유 가계부 단위)이라 이번 범위 밖.


### 반응형 UX 개선 — 작은 화면 CRUD 가려짐/발견성 (2026-07-22, front 미커밋)
사용자 불만 "작아지면 추가/수정/삭제 선택이 안 보임" → Explore 3병렬 audit → 계획 승인(P1~P3 전체) → 구현+browse E2E 검증 완료. 계획=`~/.claude/plans/ux-tranquil-truffle.md`.
- **P1-1 매매 Drawer→FormSheet**: `portfolio-trade-section`·`realized-pnl-rail`의 자체 Drawer가 `--bottom-tab-h` 보정 누락 → 하단 버튼이 탭바(z500)에 가려짐. FormSheet 재사용으로 일원화.
- **P1-2 FormActions 신설**(`_features/common/components/form-actions.tsx`): 취소/저장/삭제 공통 블록 + sticky(bottom=`calc(--bottom-tab-h + --safe-bottom)`, 음수마진으로 body padding 파고듦). 8개 폼 교체(account/category/fixed/household/portfolio/transaction form + asset-form + trade-form). `sticky={hideCard}` — 페이지 모드는 일반 배치.
- **P2**: 추가 진입점 6곳 ActionIcon 18px → `Button size=sm radius=xl` "＋ 추가" 라벨 버튼(360px에서 MonthPicker와 공존 OK). 거래 툴바 필터칩 ScrollArea type=never 가로스크롤 + Select w160→140 flexShrink0. **부작용 발견·수정**: ScrollArea 안 칩이 shrink돼 라벨 세로꺾임 → FilterChip에 whiteSpace nowrap+flexShrink 0.
- **P3**: `.stat-amount`(clamp 13~18px) 3열 요약 금액(month-summary·home-section) / 차트 툴팁 `allowEscapeViewBox y` + 감싸는 Card `overflow:visible`(wealth-section·account-balance-trend·portfolio-value-trend·account-report·total-asset-hero) / 터치타깃(멤버삭제 28→40 hitbox·MonthPicker lg·hero blur토글 lg·박제 pill 8×14) / 홈 도넛 `cols={{base:1,xs:2}}` / 드릴다운 Modal→FormSheet / `--z-fab` 레거시 토큰 제거. DateInput 포털은 theme defaultProps에 이미 있어 스킵(개별 지정하면 zIndex 1100 덮어써서 오히려 회귀 — 주의).
- 검증: typecheck/lint✅(test는 테스트파일 0개라 원래 exit1). browse E2E — 360×640/360×560 거래·매매 수정시트 삭제버튼 탭바 위 고정✅, 768 시트 중앙✅, 1280 페이지모드 non-sticky✅, 홈 1열 도넛✅.
- 검증용 데이터: 로컬 DB에 `uitest@test.com / UItest1234!` 계정(가계부 UI검증, 테스트통장/테스트증권/테스트종목, 거래 1건) 생성됨 — QA 재사용 가능, 거슬리면 삭제.

### 투자 새로고침 + 종목 시트통일 + 전도메인 삭제가드 + 멤버 시트화 (2026-06-03, 미커밋, front+back)
- **P1 투자 시세 수동 새로고침**: 백엔드 `market_price.refresh(session, markets, household_id?)` 에 household 스코프 추가(repo `find_active_distinct_code_market_by_household_and_markets`), `POST /portfolio/refresh-prices`(CurrentHousehold, 4시장, 가격은 시장공통이라 bulk update 는 전 가계부 적용·fetch 만 보유종목 한정). 프론트 투자메인 헤더 IconRefresh 버튼 → `refreshMutation`(invalidateAll).
- **P2 종목 추가/수정 시트 통일**: `usePortfolioSheetStore(open(editId?,accountId?))` + `PortfolioSheet`(UserShell). PortfolioForm `defaultAccountId` prefill. 트리거 교체: 투자메인(+버튼), 계좌상세 account-portfolio-section:224(그 계좌 프리필), 종목매매 portfolio-trade-section handleEditPortfolio(수정). 페이지 라우트는 fallback 유지.
- **P3 삭제 가드(도메인별 혼합)**: ErrorCode PT002/AC001/CT001 신설. **종목**=quantity>0 차단(`delete_portfolio` + archive 경로 `update_portfolio` isArchived; 프론트 삭제버튼 disable+힌트). **통장**=거래(from/to 양방향)·종목 있으면 차단(`TransactionRepository.exists_active_by_account_id`, `PortfolioItemRepository.count_active_by_account_id`). **카테고리**=거래·고정비 있으면 차단(각 repo exists) — ⚠ 이후 back 8dd4d12 "삭제 정책 cascade 개편"으로 바뀜: 카테고리는 막지 않고 이름 유지, 통장은 보유 종목만 차단·거래 cascade(2026-09-12 코드 확인). **고정비**=DB FK SET NULL 로 안전, 가드 없음. **가계부**=cascade soft-delete 전 자식(`_cascade_soft_delete_children`: household_id 보유 9개 모델 bulk UPDATE + account_snapshots 는 account_id 서브쿼리) + 프론트 강한 확인모달(red).
- **P4 멤버 관리 시트화**: `useMembersSheetStore` + `MembersSheet`(UserShell). 설정 진입점 navTo→openMembers. MembersSection `inSheet` prop(SubHeader 숨김), 멤버삭제 JS confirm()→Mantine modals.openConfirmModal.
- **검증**: 프론트 typecheck+lint 통과. 백엔드 app import OK(75 routes, refresh-prices 등록). ruff venv 미설치로 스킵. 브라우저/curl E2E 미실시.
- **알려진 엣지**: 종목 매매 상세에서 시트로 archive 시 상세에 잔류(통장 리포트와 동일 류, 드묾).

### UX 일관화 — 폼 전부 bottom sheet 통일 + 도넛 외N + 통장타입 축소 (2026-06-03, 미커밋)
- **#1 종목비중 "외 N개" 전 도넛 펼침**: `PortfolioDonut` 내부 rest 도 LegendRow(children)로 — 탭하면 묶인 항목 Collapse. 홈 자산구성·투자·계좌상세 전부 적용. `general.etc_count` 에서 `{percent}` 제거(LegendRow 가 우측 % 별도 표시).
- **#3 통장 추가 타입 축소**: account form `CREATABLE_ACCOUNT_TYPES=[LIVING,SAVINGS,INVESTMENT]` 로 필터(수동자산 타입은 자산화면 전용이라 제외).
- **#2 추가/수정/상세 UI 전부 bottom sheet 통일**(사용자 결정): 공용 `FormSheet`(common/components, quick-add Drawer 일반화) 신설. 각 폼 훅에 `onDone` 옵션(시트 close), 폼 컴포넌트에 `hideCard`(Fragment 분기) 추가. 전환: 거래(수정=row클릭, QuickAddStore+editId), 통장(account/store useAccountSheetStore, 추가=wealth/account-section·수정=report-section), 자산(wealth-section Modal→FormSheet), 카테고리·고정비(섹션 local state), 가계부(useHouseholdSheetStore, switcher+section), 종목추가(invest local state). **페이지 라우트 삭제 안 함**(deep-link fallback). 리치 상세(account 리포트·invest 포트폴리오)는 페이지 유지.
- **알려진 엣지**: 통장 리포트(/account/[id])에서 시트로 **삭제** 시 시트만 닫히고 삭제된 통장 리포트에 잔류(이전엔 /account 이동). 드물어 보류 — 후속.
- **검증**: typecheck·lint 통과. 브라우저 E2E 미실시.

### R5b 트랙② 디자인·브랜딩 + i18n 전건 (2026-06-03, front 13커밋)
- **로고 풀세트**: "모음" 마크(겹치는 세 원 → 중앙 핵 수렴 = "여러 자산이 한곳으로". codex 교차검토로 A/B/C 시안 중 B안 채택). `design/logo-20260603/`(mark.svg·워드마크 라이트/다크·favicon 세트·브랜드 README). BrandLogo(로그인·사이드바) 구식 지갑아이콘 → 새 마크 inline SVG.
- **favicon 500 픽스**: Next14 App Router는 `app/icon.svg`를 `/icon.svg` 라우트로 자동 등록하는데 `metadata.icons.icon`에 `/icon.svg`를 또 지정 → 경로 충돌로 500. metadata에서 /icon.svg 제거, app/icon.svg를 구식 ₩ 임시아이콘 → 새 마크로(자동 favicon 정본), public/icon.svg 중복 삭제.
- **로딩 중앙정렬**: Suspense fallback·인증가드의 `<Center py="xl">`(높이 없어 상단 붙음) → 공통 `PageLoader`(mih=70dvh) 13곳 통일.
- **i18n 하드코딩 124건 전건 제거**: 통화(`useMoney` 훅 ko"1,000원"/en"₩1,000")·단위(`general.unit` 주/개/만)·날짜(`useMonthLabel`·`general.weekday`/`year_month`)·개별텍스트(`wealth` NS 신설 포함 9개 NS)·메타데이터(`generateMetadata` 동적화). 공통 인프라(헬퍼+키) 메인 선작업 후 컴포넌트 치환은 서브에이전트 병렬(json 충돌 회피).
- **검증**: typecheck·lint·build 통과 + `/browse`로 `/en` 4페이지(login·home·transactions·invest) E2E — UI 한글 0건(잔존은 전부 사용자 데이터: 계좌명·종목명·카테고리·household명). 통화 ₩·etc_count·month-picker·필터·계좌카드 메타 전부 영어 확인.

### R5c — running balance 머지 전 리뷰·핫픽스 (2026-06-03)
4소스 교차 리뷰(fastapi-reviewer·code-reviewer·codex 양레포 **소스 전체** 스캔) 후 **5개 즉시 fix → typecheck/lint/py_compile 통과, 커밋 진행 중**:
- [back] 포트폴리오 평단 replay 통합(`portfolio/service.py`) — 매도후재매수 평단 왜곡(133.33 vs 정답150) 수정. `_recompute_realized_pnl`이 최종 보유 반환→avg_price 재사용
- [front] 거래필터 0건 시 무한스크롤 영구정지(`account-ledger-view.tsx`) — early return 제거, sentinel 유지
- [front] 0원 이체 방향 판정 견고화(`ledger-row.tsx`) — signedAmount 부호 대신 accountId 매칭
- [back] access token DEBUG 로그 제거(`deps.py`) + unused logger/logging 정리
- [back] GET /user/{id} 인증 가드(`user/router.py`) — 이메일 무인증 노출 차단

**미수정 백로그** (머지 후/별도 — 대부분 멀티테넌시·single-user면 위험 낮음. codex 전체 스캔 발견):
- 🟡 [back] `sum_for_account` household 필터 누락(repository.py) · 매매손익 `to_date` 무시하고 today()(portfolio:502) · 거래수정 검증이 생성보다 약함 · fixed_expense_id·수동자산 계좌타입 소유검증 누락
- 🟡 [front] X-Household-Id 경쟁조건(onboarding-guard effect 보정이 children 쿼리보다 늦어 stale id 요청)
- 🟢 자기이체 부호검증 · carry_balance 평문커서(HMAC) · Money float 직렬화 · home-section KST 미적용 · 보유종목 행 cost 재계산 · paid_by_user_id 멤버검증

---

R1~R5a 전부 dev 커밋 완료. **dev→main 머지는 아직 안 함** — R5a 사이클 끝났으니 머지 검토 시점.
- ✅ **R5a-1 (asset_class + 현재 배분 파이)** — front `64d7571`.
- ✅ **R5a-2 (ManualAsset 부동산·연금)** — `94452dd`. manual_asset 도메인 + REAL_ESTATE/PENSION roll-up + double-counting 구조적 불가.
- ✅ **R5a-3 (월별 배분추이) — 완료·커밋**.
  - **설계 변경**: 전용 `asset_class_snapshots` 테이블(원안) 폐기 → **방안 B 경량**. PortfolioValueHistory에 `asset_class` 컬럼 1개 추가 + 조회 시점 AccountSnapshot+PVH 조합 on-the-fly 집계. 새 도메인/테이블 0개.
  - 백: PVH 컬럼+마이그레이션 `c9d4e7f21a36`(백필 UPDATE)+박제 기록(snapshot_service)+`build_allocation_trend`(wealth/service)+schema `allocationTrend`+`resolve_snapshot_range` 헬퍼 추출.
  - 프론트: `allocation-trend-chart.tsx`(useMounted SSR 가드+스택 AreaChart+0패딩) + types `AllocationTrendPoint` + wealth-section 부착. api.ts/i18n 수정 불필요(타입 참조·기존 enum 키 재사용).
  - 검증: 가역성 왕복 · curl(모든 월 trend==yearly·ratio100·cash 역산·이중계상0·수동박제 후 5월 부동산/연금 반영) · **E2E 렌더(5개 자산군 스택, 색상·툴팁)** 전부 통과.

### R5a-3 핵심 통찰 (재작업 방지)
- 부동산/연금 과거 as-of = **AccountSnapshot의 REAL_ESTATE/PENSION 계좌 roll-up balance**(매달 박제됨) → ManualAsset 평가이력 테이블 불필요(R5a-2에서 미룬 것 끝내 안 만듦).
- INVESTMENT 과거 cash = `AccountSnapshot.balance − Σ그달 PVH.valuation` (`_calc_balance` balance=cash+valuation 역산, 같은 시점·공식이라 등식 성립).
- PVH에 asset_class 박제 → 종목 재분류돼도 과거 배분추이 박제값 유지(codex "aggregation loss" 해소).

## Context

- 이 컴퓨터: 백 **9000**(2026-07-22 확인 — next.config rewrites가 9000 프록시. `uv run uvicorn app.main:app --port 9000`, 선행조건=Docker Desktop 기동→`household-postgres` 컨테이너 5432), 프론트 **3000**, DB head = `3ef71953bb00`. 계정 yangjinho826@naver.com / wlsghdid2@ / household=`62cfbbe6-...`. 인증 = Bearer + `X-Household-Id` 헤더.
- **로컬 DB는 항상 `alembic upgrade head` 선행** (드리프트 시 배분/거래 조용히 500 — R5a-1 QA 때 실제 발생).
- **배분 정합 핵심**: 부동산/연금은 전용계좌(REAL_ESTATE/PENSION AccountType)로 roll-up. `_build_allocation`이 account_type→asset_class 매핑(전용계좌 balance를 해당 슬라이스로). ManualAsset 따로 합산 X → double-counting 구조적 불가.
- **전용계좌 lazy 생성** (가계부당 부동산 1/연금 1, `_ensure_rollup_account`).
- **평가이력 테이블(manual_asset_valuations)은 R5a-2에서 안 만듦** — 현재값만(`manual_assets` 단일). 과거 평가액 carry-forward는 R5a-3에서.
- 미해결: 금/채권ETF가 아직 `asset_class=STOCK`(마이그레이션 기본값). 사용자가 폼에서 COMMODITY/BOND 재분류 필요.
- 프론트 실제 스택 = Mantine + query-key-factory + tabler + 언더스코어 디렉토리.
- **provider 순서 함정**(base-layout.tsx): `NextIntl > Mantine(+Modals) > QueryProvider`. → `modals.open()` portal 컴포넌트는 **QueryClientProvider 밖**이라 useQuery/useMutation 하면 "No QueryClient set" 런타임 에러. 쿼리 쓰는 폼은 트리 내 `<Modal>`로 직접 렌더하거나 페이지로. (manual-asset 폼은 `<Modal>` 직접 렌더 — 브라우저 QA에서 발견·수정). typecheck/lint/curl 다 통과해도 못 잡는 에러 → 렌더 검증 필수.

## R5b 진행

- ✅ **트랙 ① 자산성격 제거 + 금/실물 수동자산 편입** (front+back, 커밋·push 완료).
  - 종목 `asset_class` 폐지 → 종목 전체 = `INVESTMENT` 한 슬라이스. `AssetClass` enum에서 STOCK/BOND 제거.
  - 금/실물은 ManualAsset에 `COMMODITY` 추가(REAL_ESTATE/PENSION과 동일 전용계좌 roll-up). `AccountType.COMMODITY` 신설.
  - 백: portfolio model(2컬럼 DROP)/schema/service/snapshot, wealth/service(INVESTMENT 합산+COMMODITY 분기), manual_asset, account/enum. **account/service.py `_calc_balance` COMMODITY 분기 추가**(검증 중 누락 발견 — 안 하면 금 계좌 balance 0). 마이그레이션 M1 `a1c2e3f4b5d6`(portfolio_items), M2 `b2d3f4a5c6e7`(PVH) — **head=b2d3f4a5c6e7, 가역성 왕복 검증됨**.
  - 프론트: portfolio types/constants/form/use-form, manual-asset, account types/constants, wealth-section, ko/en.json.
  - 검증: 마이그레이션 왕복 · typecheck · curl(배분합==총자산 771,377,260·이중계상0·STOCK/BOND부재·INVESTMENT등장·추이 INVESTMENT합산) · **금 COMMODITY 등록 E2E(등록→계좌 lazy생성→balance roll-up→배분 COMMODITY 슬라이스→삭제 원상복구, 모두 통과)**. 미검증: 브라우저 시각 렌더(타입·데이터로 안전 담보).
  - ⚠️ 빈 "금·원자재" COMMODITY 계좌(balance 0)가 검증 중 lazy 생성되어 DB 잔존 — 무해(필터 제외, 진짜 금 등록 시 재사용).
- ❌ **트랙 ③ 수익률(TWR) + 자산군별 목표(goal)** — 구현했다가 **사용자 판단으로 전체 롤백**("월별 배분추이까지가 딱 좋다, 과하다", 2026-06-01). DB head c3e5a7b9d1f2→b2d3f4a5c6e7 downgrade, goal 도메인/마이그레이션/`_features/goal`/twr-trend-chart 삭제, wealth service/schema/types/api·wealth-section·main.py·queries.ts에서 TWR/goal 부분 제거. typecheck·curl(wealth twr 필드 없음·goal 404) 확인. **트랙①은 유지**(자산성격 제거 — 사용자가 원했던 단순화).
- 🔄 **트랙 ② 디자인 전면 개편** — 로드맵 `~/.claude/plans/optimized-singing-russell.md`. (사용자가 토큰화→**전면 개편**으로 확대: IA 재편+레이아웃+차트+리브랜딩)
  - 결정: 차트=**Mantine Charts**(@mantine/charts), 브랜드명=**모음**(한글), IA=**자산중심 4탭**, 시각=**design-shotgun 시안**.
  - ✅ **구조 트랙 S1~S5 완료·dev push(ba8da2a)**: S1 portfolio→invest 라우트 이동 / S2 레거시 308 리다이렉트(middleware.ts) / S3 4탭화(홈·거래·투자·내정보)+nav i18n / S4 /wealth 슬림화(hero·도넛·계좌타입 진행바 제거+SubHeader, sub-route화) / S5 홈=자산 대시보드(`TotalAssetHero` 추출 + wealth/home/portfolio 3쿼리 조합: 총자산 hero·자산군 도넛·투자손익·가계부 요약·최근거래). S6(카테고리 이관) 스킵(stats.monthly 엔드포인트 미검증).
  - QA: /browse 로그인 → 홈/자산/투자 전 화면 렌더 + 3 API(home/wealth/portfolio overview) 200 + 콘솔 에러 0(recharts width warning만 — V4서 h prop으로 해소).
  - 🔄 **시각 트랙 진행**: ✅V1 무드 선택 완료 → V2 DESIGN.md(design-consultation) → V3 토큰화(하드코딩 hex 10~15군데 정리) → V4 차트 Mantine Charts 교체 → V5 리브랜딩("가계부"→"모음": layout/manifest/i18n/brand-logo).
  - ✅ **V1 완료(2026-06-02)**: design-shotgun이 OpenAI 키 없어 AI 이미지 불가 → **HTML 코드 목업 폴백**으로 홈 대시보드 3무드(A Clean Slate 토스풍 / B Midnight Vault 다크 / C Warm Ledger 따뜻) 비교보드 생성. **사용자 선택 = C · Warm Ledger**. 토큰: bg #FAF6EF / card #FFFDF9 / primary 세이지 #7C9473 / accent 테라코타 #D98E73 / text #3C3530 / 세리프 헤드라인 / 24px 라운드. 상세=`~/.gstack/projects/yangjinho826-household-front/designs/home-dashboard-20260602/approved.json` + board.html.
  - ✅ **V2 완료(2026-06-02)**: `DESIGN.md`(프로젝트 루트) 작성 + **codex 교차 검토 반영**. Warm Ledger 디자인 시스템 명세. 최종 확정:
    - **세리프 = 브랜드 로고("모음")만**(codex가 한글 세리프 이질감/로딩으로 축소 권고 — 섹션타이틀도 Pretendard). h1만 선택적.
    - **의미색**: 수입 파랑·지출 빨강 유지 + **초록 역할 분리** → `sage`(브랜드/액션) vs **`positive` #2F855A(양수·수익)**. 기존 `linerGreen` #22C55E 폐기→positive 치환(7곳+: total-asset-hero·value/account/portfolio-trend·snapshot-drilldown·account-report·account constants SAVINGS).
    - primary=세이지, **primaryShade light 5→6**(#647A5C — 대비 3.34→4.73 AA). accent=테라코타(shade4 #E5B197로 벌림). gray=웜그레이 교체, **textDim gray.5→6 #7A6F63**(대비). 카드 radius xl→3xl(이미 토큰 존재), defaultRadius는 유지(전역 영향 방지). 갈색톤 그림자.
    - **8장 = V3 작업 명세서**(mantineTheme.ts 변경표 + 8-3 linerGreen→positive 치환 파일목록 + design-tokens.ts TOKEN). primary 사용규칙: "수입은 반드시 c=info 명시".
    - 검토 경로: design-consultation 스킬은 프리뷰가 OpenAI 키 필요라 스킵→직접 작성, **codex exec로 교차 검토**(codex CLU 0.134 인증OK). 사용자: design 이미지용 OpenAI 키는 효용 낮은 단계라 안 만듦.
  - ✅ **V3 토큰화 완료·커밋(2026-06-02, dev 미push)**: 커밋 099e466(DESIGN.md)·e597f09(토큰)·d0aff98(작업기록). mantineTheme(sage/terracotta/positive tuple, gray 웜그레이, primaryColor info→sage shade6, 갈색그림자, Card 3xl) + design-tokens TOKEN(green→positive) + 사용처(linerGreen→positive 8곳, TOKEN.green→positive 3곳, brand-logo sage) + globals.css 배경 #f2f4f6→크림 #faf6ef. typecheck/lint 통과, 로그인 화면 렌더로 sage/웜그레이 확인.

  - 🔀 **방향 전환 → "화면별 레이아웃 리워크"** (2026-06-02): 사용자가 V3 후 "화면이 예전과 똑같다"(색만 바뀜). **오해 정리**: gstack 디자인 스킬(design-shotgun/consultation/review)은 전 화면 자동 재디자인 도구 아님 — 무드 시안+명세+QA고 레이아웃 코드는 내가 짜야 함. 사용자 기대=로그인부터 전 화면 디자이너 패스. **경로 B 선택**(OpenAI 키 없이 내가 직접 리워크 + HTML 목업 미리보기. Gemini는 design 바이너리가 OpenAI 전용이라 불가).
  - 🔄 **로그인 화면 리워크 진행 중 (V4 차트 전에 끼어듦)**:
    - codex 검토 완료 → **A안(중앙 미니멀) 채택 + B(브랜드강조) 따뜻한 카피만 흡수**. 보완: 완전중앙말고 상단45% 보정중앙(키보드), 약관카피는 실제 링크없으니 제거, 세리프 워드마크 1회만, pill 버튼 OK.
    - **미커밋 적용분 3파일**: `base-layout.tsx`(Noto Serif KR CDN link 추가) / `globals.css`(`.brand-wordmark` 세리프 클래스) / `(guest)/layout.tsx`(bg white→크림 #FAF6EF + flex 수직중앙).
    - **남은 작업**: ① `login-section.tsx` A안 리워크(브랜드블록=BrandLogo+"모음" 세리프 워드마크(className brand-wordmark)+캐치프레이즈 / 입력 / pill 버튼 / 회원가입·약관 주석블록 제거) ② i18n `auth.brand_name`("모음")·`auth.brand_tagline`("매달 내 자산이 어떻게 변하는지" 류) ko/en 추가 ③ typecheck ④ dev 재시작 후 browse 시각확인.
    - **아이콘 결정 = D(전용 로고)**: 사용자가 Recraft.ai(SVG 무료) 또는 크몽/디자이너로 "모음" 로고 제작 → 받으면 내가 `public/icon.svg`·192/512·apple-touch + `brand-logo.tsx`(현재 tabler IconWallet placeholder) + `manifest.json` 교체. 로고는 로그인 레이아웃과 독립(자리만 잡아둠).
    - **반응형**: 로그인=(guest) `Container size=448` 고정중앙이라 데스크톱/태블릿/폰 거의 동일(폰 목업=데스크톱). **(user) 화면(홈 등)은 데스크톱서 user-shell-wrap 사이드바+메인 2단**이라 홈 리워크 때 3뷰포트 별도 설계 필수.
    - **환경 주의**: dev 서버 워커 크래시 빈발("Jest worker exceeding retry limit" — 재시작 필요). 백엔드 8000 DOWN → 홈/자산/투자는 force-dynamic이라 백엔드 없으면 500(로그인=(guest)는 백엔드 불필요).
  - ✅ **로그인 화면 리워크 완료(2026-06-02, dev 미커밋) — 개선 B 채택**: 처음 A안(중앙 미니멀)으로 구현했다가 **사용자가 로그인 보드(login-redesign-20260602/board.html) 3번째=개선 B로 변경 요청**("시안 3번/C로"). 보드는 [현재]·[개선 A 중앙미니멀]·[개선 B 브랜드강조+카드시트] 3컬럼(C 라벨 없음, 3번째=B).
    - **개선 B 구조**: (guest)layout = Container 448 + px0 + 상단 따뜻한 그라데이션(`linear-gradient(180deg,#F3E6DA 0%,#FAF6EF 38%)`) + flex column. login-section = hero(좌정렬 BrandLogo 64 + "모음" 세리프 40px brand-wordmark + 태그라인 keep-all, padding 64/28/32) + 하단 카드 시트(marginTop auto·TOKEN.card·radius 28 28 0 0·위로 그림자·padding 30/26/40) 안에 입력+pill 버튼. form flex:1.
    - i18n `auth.brand_name`("모음"/"Moeum")·`auth.brand_tagline`("매달 내 자산이 어떻게 변하는지 한눈에 모아봐요" — B 따뜻한 카피) ko/en + brand-logo aria-label "가계부"→"모음".
    - typecheck 통과 + **browse 시각확인(390 모바일 + 448 박스, 콘솔 에러 0, 그라데이션·세리프 명조 로드·카드시트·pill 의도대로)**. Noto Serif KR `notoLoaded:true` js 확인.
    - 미커밋 3파일(base-layout Noto Serif link / globals.css .brand-wordmark)도 그대로 미커밋. (guest)layout은 B로 재수정됨.
    - ⚠️ 미검증: 로그인 **실패 토스트** 동작(백엔드 8000 DOWN이라 로그인 시도 불가). 새로고침 제거는 코드레벨 확실.
  - 🐛 **보너스 버그 fix(2026-06-02)**: 로그인 실패 시 페이지 새로고침되던 것 = `return-fetch-refresh.ts`가 로그인 401을 "세션만료"로 오인→refresh 시도 실패→`redirectToLogin()`의 `location.replace`로 리로드. 응답 인터셉터 체인이 안쪽부터(refresh가 api보다 먼저 401 가로챔)라 onLoginError 토스트 도달조차 못 함. **수정**: `isAuthEndpoint`(login/logout/refresh) 401은 refresh 스킵→api가 ApiResponseError throw→onLoginError 토스트. 사용자: 토스트 방식 유지 결정.
  - ✅ **홈 화면 리워크 완료(2026-06-02, 커밋)** — 무드 C(Warm Ledger) 확정 후 **B 압축 레이아웃** 구현: hero → 자산도넛+투자 2열 그리드 → 가계부 → 최근거래. 추이차트/자산군도넛/FAB 색 Warm(sage/terracotta)로 통일, theme-color #3B82F6→sage. 자산분해 인라인펼침 → **중앙 모달**(Mantine Modal). 홈 멘트 전부 i18n(`home` 네임스페이스 38키 ko/en, "원"·월라벨·평가손익·모달·FAB aria까지). **QuickAddFab(+버튼) 제거**(콘텐츠 가림+팝업 점프 불만), user-shell paddingBottom·데스크톱 --bottom-tab-h:0·scrollbar-gutter:stable 정리. PortfolioDonut 세로모드 추가. (목업=`~/.gstack/.../home-dashboard-20260602/board-layout.html`)
  - ✅ **백엔드 정합 검증 완료(2026-06-02) — 직전 "R5a-1 미스매치" 기록은 오기록이었음**: `household-back` dev HEAD = `5ce324d`(머지), R5a-2(`b0c9687`)·R5a-3(`93173bf`)·트랙①(`2c50bb8`) **전부 커밋·push 돼 있음**(로컬=origin/dev 0/0). 직전 세션이 멈췄다고 본 `63d90a6` 위로 4커밋 더 살아있음. 검증: `wealth/service.py:78` 은 `item.asset_class` 안 쓰고 무조건 `AssetClass.INVESTMENT` 합산 / enum 에 STOCK 없음(INVESTMENT/COMMODITY/CASH/REAL_ESTATE/PENSION/OTHER) / PortfolioItem 모델 asset_class 폐지 / alembic 단일 head `b2d3f4a5c6e7`(asset_class add→drop 전체 여정). `radiant-cooking-key.md` 백엔드 재구현 계획은 **불필요**(작업 이미 완료). ⚠️ 런타임(8000 띄운 실제 응답)은 미검증 — 정적 검증만.
  - ✅ **거래 화면 리워크 완료(2026-06-02, 미커밋) — codex 리뷰 반영 v3**: 목업 3차(`~/.gstack/.../transactions-rework-20260602/board.html`) → codex 디자인 리뷰 → 구현+실렌더 검증. **구조**: 헤더(Title+MonthPicker+추가FAB) → **MonthSummary**(stats/monthly: 수입·지출·저축률 + 지출카테고리 Top5 ratio 바, 리스트/캘린더 공통상단) → **TransactionToolbar**(세그먼트+타입칩+계좌Select 한 카드 = codex Top1 "동동 뜬 세그먼트" 해소) → 콘텐츠. codex Top2(리스트/캘린더 IA 통일=캘린더에도 요약), Top3(선택일 info→sage, radius 14px, 저축률 음수=dimmed) 반영. 신규 파일=`_sections/transactions/components/{month-summary,transaction-toolbar}.tsx`. **계좌필터=리스트뷰 전용**(calendarFull API 가 일별합계까지 묶여 accountId 미지원 — 캘린더는 보류). **백엔드**(household-back, 미커밋): `transaction/repository.py` 정렬 `id.desc()`→`tx_date,frst_reg_dt,id desc`(id=uuid4라 같은날 무작위였음→입력순=frst_reg_dt) + 커서 2-tuple→3-tuple, `service.py` next_cursor 동일. 검증: front typecheck/lint·back 커서로직·실렌더(모바일/데스크톱 리스트+캘린더 5월데이터, 콘솔에러 0). i18n `transaction.summary_*`/`filter_all_accounts` ko/en. ⚠️ 무관 이슈: 로그인직후 홈(/ko) 400 1건(거래와 무관, 미조사).
    - **피드백 3건 보정(2026-06-02, 미커밋)**: ① month-summary 카테고리 섹션 빈 달에도 유지+"지출 0원"(`summary_no_expense`) ② calendar-view 우측 "선택일 거래" 라벨을 카드 내부 헤더로 이동→좌측 달력 카드와 박스 크기/상단 정렬 일치(라벨이 카드 밖이라 어긋났던 것) ③ **모바일 날짜피커 가림 fix**: quick-add-sheet(바텀 Drawer) 안 DateInput popover가 컨테이너에 잘림 → mantineTheme `DateInput.defaultProps.popoverProps={withinPortal:true,zIndex:1100}` 전역(거래추가+포트폴리오매매폼 공통 해결). DateInput 은 `dropdownType` prop 없음(DatePickerInput 전용)이라 popoverProps 로. typecheck/lint·실렌더(6월 0원·5월 캘린더 박스·날짜피커 달력 온전) 검증.
  - ✅ **투자 화면 리워크 완료(2026-06-02, dev 커밋·미push) — A안 채택**: codex 기획·디자인 2회 리뷰 반영. 커밋 3개(`3dce05b` 차트색통일 / `36bf8f8` 투자 메인 리워크 / `ef77fa6` 전량매도 fix). 기획=`~/.claude/plans/refactored-hopping-sketch.md`.
    - **범위 = 투자 메인(/invest)만**. 계좌상세·종목상세는 다음 사이클. 목업=`~/.gstack/.../invest-rework-20260602/board.html`(A안 추이생략·추천 채택).
    - **portfolio-section 리워크**: Title "포트폴리오"→"투자"(탭통일)+종목추가 FAB / 잔액중심 2×2 Hero → **손익 Hero**(대표=평가액 totalValuation·손익 pill·메타 매입·현금) / 계좌별 도넛 → **종목별 비중 도넛**(Top5 고유색+기타·현금 회색묶음, codex "7색순환 혼동" 해소). i18n=portfolio 네임스페이스 키 추가(ko/en).
    - **차트 = recharts v3 유지**(codex 강권: @mantine/charts는 recharts3→2 다운그레이드 blast radius 큼). 미커밋 차트색통일분(design-tokens 팔레트 단일화+utils 중복제거+value/allocation-trend sage·웜그레이) 함께 커밋.
    - **손익색 = 기존 한국식 유지**(양수 danger 빨강·음수 info 파랑, profitColor). 목업의 positive 초록은 폐기(계좌상세·종목상세와 일관).
    - **전량매도 버그 fix(A 최소)**: 종목 전량매도 시 soft delete(data=null)되는데 portfolio-trade-section이 useSuspenseQuery로 재조회→404 throw로 화면깨짐. trade-form이 `res.body.data===null`→soldOut 신호, section이 cancelQueries+removeQueries(item) 후 계좌상세로 router.replace. **B(매매 화면 분리)는 다음 사이클**.
    - 검증: typecheck✅·lint✅. ⚠️ **browse 시각검증 미실시**(사용자가 커밋 먼저) — 전량매도 A fix 실동작·모바일/데스크톱 렌더 다음에 확인 권장.
    - ⚠️ codex 지적 중 **실현손익 진입점 보류**: overview summary에 누적 실현손익 필드/전체 매매손익 라우트 없음→거짓 진입점 우려로 미반영. 백엔드 필드 생기면 Hero 메타에 추가.
  - ✅ **투자 계좌상세·종목상세 리워크 완료 + 매매손익 IA 이동(2026-06-02, dev 커밋·미push)** — 계획 `~/.claude/plans/browse-async-blanket.md`, 목업 `~/.gstack/.../invest-rework-20260602/board-detail.html`, codex 디자인 리뷰 반영.
    - **핵심 IA 변경**: 종목상세 "매매손익(실현손익)" 탭은 전량매도 시 종목 soft delete로 조회 사각지대 → **종목 레벨→계좌 레벨로 이동**. 종목상세는 거래내역 단일(탭 제거), 계좌상세에 "누적 매매수익"(전량매도된 종목 매도까지 합산).
    - **백엔드(household-back, 미커밋)**: `/api/portfolio/accounts/{id}/realized-pnl` 신설(router/service `get_realized_pnl_by_account`/repository `find_sell_txs_by_account`(account+household 필터, ACTIVE SELL — 삭제 종목 매도 포함)/schema `RealizedPnlRow.name` 추가). **새 컬럼/마이그레이션 0** — `realized_pnl` 박제(`a3f7c9d2e1b8`) 재활용. (이전 "실현손익 진입점 보류"의 백엔드 부재가 이걸로 해소)
    - **프론트(미커밋)**: `RealizedPnlPanel` portfolioId|accountId 분기(내부 ItemRealizedPnl/AccountRealizedPnl + 공통 View — useSuspenseQuery 조건부 호출 불가라 컴포넌트 분리). account realized-pnl 쿼리/키/api/타입(name?) 추가. 계좌상세: hero 라벨 "계좌 총액"(codex #2 명확화)+평가손익 pill, 도넛 메인규칙(정렬후 PALETTE+기타/현금 회색), 누적 매매수익 패널, +종목추가 sage·chevron 토큰. 종목상세: 매매손익 탭 제거·전량매도 토스트 문구·i18n. portfolio 네임스페이스 키 다수 추가(ko/en).
    - 검증: typecheck✅·lint✅·**browse 통합검증✅**(dev useContext null 500은 중복 next dev 프로세스 정리+.next 삭제+재시작으로 해소). 계좌상세(계좌총액·pill·도넛PALETTE·누적매매수익 API 200·**전량매도된 KIWOOM 실현손익이 계좌 누적에 반영 확인**), 종목상세(매매손익 탭 없음·거래내역만), 모바일390+데스크톱, 콘솔에러 0(recharts width warning만). 전량매도 직접 실행은 실데이터 변경이라 미실시(KIWOOM 사례로 동작 입증).
    - **디자인 후속(2026-06-02)**: 누적 매매수익을 풀 패널→**도넛 하단 "레일" + 바텀시트**(codex 옵션①, `realized-pnl-rail.tsx`). 기간은 프리셋(1·3개월/1년) 폐기→**날짜 자유 선택**(시작일/종료일 DateInput+달력). 카드 박스 구분 약함 → 배경 진하게(#ece2ce)+그림자 강화 시도했으나 **사용자가 색 원복 요청** → Card `withBorder`+웜그레이(gray.2) 테두리로 경계만(배경 #faf6ef 유지).
    - **커밋 완료(dev 미push)**: front 4커밋 `4ad6dd7`(데이터+i18n)·`35c734e`(UI 리워크)·`035f274`(카드 테두리)·`dec28ab`(작업기록) / back `3001c7e`(계좌 realized-pnl). commit-writer는 household-back이 cwd 밖이라 back은 메인이 직접 커밋.
  - ✅ **내정보 화면 리워크 + V5 리브랜딩 + 토스 전멸 완료(2026-06-02)** — 계획 `~/.claude/plans/goofy-brewing-sky.md`, 목업 `~/.gstack/.../settings-rework-20260602/board.html`(A안). 트랙②의 마지막 화면.
    - **내정보(settings-section A안)**: 토스풍 전면 제거 + Warm 리스킨. 프로필 **Hero**(sage 아바타+크림 그라데이션 카드)에 통계 3개(통장/거래/종목) 흡수 → 다른 4탭 hero-시작 패턴 일관. info.5(파랑)→sage, 하드코딩 #4E5968/#8B95A1→웜그레이 토큰, Card 기본 테두리(theme). **`settings` i18n 네임스페이스 신설**(ko/en, 하드코딩 한글 전멸).
    - **셸 무드 리스킨**(sidebar-nav/bottom-tab/app-header): **활성탭 info.5(파랑)→sage**(DESIGN.md info=수입전용 원칙 준수), 흰배경→크림(gray.0), 토스그레이 테두리→웜그레이(gray.2). 셸 fallback "가계부"→i18n(household.list_title).
    - **사이드바 브랜드 마크 신설**: 최상단 BrandLogo(sage box)+"모음" 세리프 워드마크(brand-wordmark). **앱(모음) vs 현재 가계부(우리 가족) 위계 분리**. 데스크톱만(모바일 헤더는 공간상 생략 — 사용자 선택).
    - **household-switcher**: 파랑 info-0/5→sage-0/6(owner)·terracotta(member), 선택체크 info-5→sage-6, crown 하드코딩→warning-5. 텍스트 **i18n화**(switcher_title/count/managing/create_new + member.role 재사용).
    - **V5 리브랜딩**: **앱명만 "모음"**(manifest name/short_name/description, layout title, base-layout apple-title, icon.svg #3B82F6→sage, auth.welcome_title). manifest theme_color/bg 토스잔재(#3B82F6/#f2f4f6)→sage/크림. **household 엔티티는 "가계부" 유지**(사용자: "모음 통일은 오바" → 앱=모음/장부=가계부 분리). onboarding/household/error i18n "가계부" 전부 유지.
    - **토스 전멸**(사용자 "토스풍 다 지워"): 셸 외 잔여도 정리 — trade-form/account-report tick/error-fallback bg #8B95A1·#f2f4f6→토큰, "토스" 주석 6곳(globals.css/quick-add-sheet/sub-header/icon-box/filter-chip/color-picker) 제거. `grep "토스"`=0(토스증권/toast 제외). **데이터성 #8B95A1 2곳(color-picker 색선택지·account OTHER 타입색)은 카테고리/계좌 구분 팔레트라 의도적 유지**(무드색 아님).
    - 검증: typecheck/lint✅ · **browse 시각확인**(모바일390+데스크톱1280, ko/en 토글, 전환 드로어, 활성탭 sage·브랜드마크·프로필 hero) 콘솔에러 0. ⚠️ **검증 중 3000 포트 중복 dev 프로세스 3개 발견**(useContext null 500 유발) → 정리+.next 삭제+단일 재기동(PID 48334). codex 디자인 리뷰는 hang으로 중단 → A안 자체 판단 채택.
  - ▶ **다음 작업 = dev push(front+back 2커밋씩) → dev→main 머지(양 레포 15커밋씩)**. 미커밋분은 전부 커밋 완료. 트랙② 디자인(로그인·홈·거래·투자·내정보 전 화면 + 리브랜딩) 완료. **백로그 정리(2026-06-02, 사용자 확인): 전량매도 B(매매 화면 분리)는 이미 구현됨(trade-form+portfolio-trade-section 별도 존재) / 금·채권ETF asset_class 재분류는 안 함**. → R5b 사실상 종료, 남은 건 머지뿐.
  - ⚠️ TaskList(V1~V5 5개)는 **세션 한정이라 휘발** — 이 activeContext 의 시각 트랙 줄 + 로드맵 `optimized-singing-russell.md` 가 정본. 다음 세션은 이 둘로 복원.

> 교훈: R5a-3(월별 배분추이)까지가 사용자가 생각한 적정 스코프. TWR/goal은 과한 기능. 트랙①(자산성격 단순화)만 R5a 위에 얹음.

## R5c — 거래 후 잔액(running balance) (2026-06-03, 양 레포 미커밋)
- **입력폼 거래후잔액 미리보기**: `transaction/components/form.tsx` — 계좌 선택 시 "잔액 X → 거래후 Y". 수입 가산/지출 차감/이체 양쪽. 신규 입력만(수정모드는 balance에 이미 반영). balance는 formOptions accounts에 이미 옴(백엔드 X).
- **백엔드 ledger 엔드포인트**(household-back, 미커밋): `GET /transaction/account/{id}/ledger?cursor&limit&year&month`. 핵심=**현재(또는 그달말) 현금흐름 잔액에서 desc 역산**(첫행=기준잔액, 한칸 옛거래로 `running -= signed`). 페이지경계는 cursor에 carry 잔액 실어 이어붙임(`{date}|{reg}|{id}|{carry}`, `_split_ledger_cursor`). 이체=그 계좌 관점 부호(`_signed_amount`: to_account면 +, 아니면 INCOME +/나머지 −). **거래계좌(LIVING/SAVINGS/OTHER) 전용**(INVESTMENT는 평가액 섞임·나머진 거래없음 → 400). year+month면 그 달 거래+그달말 누적 기준. `sum_for_account`에 `to_date` 파라미터 추가. **새 컬럼/마이그레이션 0**. schema `AccountLedgerItem`(TransactionResponse+signed_amount+balance_after)/`AccountLedgerPage`.
- **프론트**: 거래 탭 list뷰 → **계좌별 ledger 전환**(`transactions-section`+`transaction-toolbar`): "전체 계좌" 제거→거래계좌만+계좌 선택 필수(첫 거래계좌 자동선택 useEffect, `allowDeselect=false`), txType filter chip은 **클라 필터**(잔액은 백엔드가 박아줌). MonthPicker 유지=그 달 거래+running balance. **계좌 상세**(`account-report-section`)에도 거래이력 섹션(전체, 월필터 없음). 신규 `account-ledger-view`/`ledger-row`. `account/constants` `LEDGER_ACCOUNT_TYPES` 공통화. ledger api/query year/month.
- **검증**: curl(역산 연속성 0위반·첫행=현재잔액 317969·마지막직전=start 517789·signed합=balance-start·이체 양방향 ±700000·월필터 5월 11건·페이지네이션 고유11/반복0) + front typecheck/lint✅ + 사용자 화면 확인✅.
- **cursor "+" 함정**: cursor에 `frst_reg_dt.isoformat()`의 `+00:00` 포함 → raw URL이면 `+`가 공백 디코딩돼 커서 깨짐. 프론트 `objectToParams`는 URLSearchParams라 `%2B` 자동인코딩=정상. curl 검증 시 `urllib.parse.quote` 필요.
- **데드코드 정리**: list-view.tsx/useTransactionInfiniteList/transaction.list·infinite/GetTransactionSearchApi/BackendTransactionListPage/filter_all_accounts(i18n) 제거.

## 병행 미결
- **dev→main 머지** — R1~R5b①(front+back) + R5b② 구조 트랙(front) 전부 dev push, main 미반영. front/back 두 레포.

> 금/채권ETF asset_class 재분류 = **안 함**(사용자 결정 2026-06-02). 트랙①에서 종목 전체 INVESTMENT 단일화·금은 COMMODITY 수동자산으로 편입했으므로 종목 재분류 자체가 무의미.
