# 결정 기록

## 2026-09-12: 홈 "이번 달 늘어난 이유" 방향 기준 — 지난 기록 대비 총자산 증감
- 결정: 제목(늘어난/줄어든)은 hero 와 같은 `totalBalance − 마지막 박제 totalBalance` 부호. 투자 행은 "투자 평가손익(누적)"으로 라벨링.
- 왜: 백엔드에 월간 투자손익이 없어 `summary.totalProfit`(누적)을 쓰는데, 순저축+누적손익 부호로 제목을 정하면 실제 증감과 반대로 나올 수 있음(QA D-2).
- 버린 옵션: 투자 자산군 평가액 월 차이(이체·매수 유입이 섞여 손익이 아님) / 월간 손익 API 신설(백엔드 작업, 배치2 이후 후보).
- 상세: `home-section.tsx` monthUp, i18n `home.invest_profit/meta_valuation`.

## 2026-09-12: 세그먼트 vs 필터 칩 시각 규칙 분리
- 결정: 화면 전환(목록/달력·화면 모드) = Mantine SegmentedControl 채움 indicator 유지, 필터 = 밑줄 칩.
- 왜: DESIGN.md §5 가 "세그먼트 밑줄 + 트랙 surface-2"로 자기모순, 승인된 shot 은 채움. 역할로 나누면 둘 다 정당.
- 버린 옵션: 세그먼트를 밑줄 칩으로 재구현(접근성·키보드 이득 없이 코드만 증가).

## 2026-09-12: S6 design-review 는 "감사만" 모드로
- 결정: 리디자인 미커밋 상태에서 /design-review 의 픽스별 자동 커밋을 쓰지 않고, 발견을 S5 코드에 반영 후 사용자 `/commit` 으로 한 번에.
- 왜: 커밋은 의도별 그룹 + 사용자 확인 규칙. 스킬 커밋은 그룹이 섞임.
- 버린 옵션: stash 후 실행(옛 화면 심사) / 먼저 커밋(사용자가 S6 를 먼저 원함).

> `/decide` 호출 시 결정 결과가 여기에 자동 append.
> 형식: `YYYY-MM-DD: <주제> — <선택 옵션> (<근거>)`

---

2026-05-28: API 호환 전략 — 기존 깨고 봉투 통일 (한 페이지 = 한 endpoint 사상으로 가는 게 명료, 점진은 어차피 모든 도메인 손대니 의미 없음)
2026-05-28: 종목 거래내역 분리 — 종목 단건 endpoint(`/items/{id}`) 와 거래내역(`/items/{id}/transactions`) 분리 (무한 스크롤 가능 + 거래 많아질 때 응답 비대 방지)
2026-05-28: 관리 페이지 페이징 방식 — 무한 스크롤(cursor) 도입 (페이지 단위 일관성 + Mantine `Pagination` 의 클라 페이지 흉내 제거)
2026-05-28: cursor 형식 — 평문 `{sort_key}|{uuid}` (transaction 의 기존 패턴 그대로 — 디버깅 가능, base64 불필요)
2026-05-28: totalCount 정책 — 관리 페이지에서만 count 계산, overview/무한 스크롤은 null (DB 부하 ↓)
2026-05-28: 종목 URL — `/portfolio/items/{id}` REST 적 (기존 `/detail/{id}` 폐기)
2026-05-28: 단일 브랜치 누적 — PR 0~6 모두 `refactor/api-cursor-overview` 한 브랜치에 (큰 단위 변경의 일관성 우선)
2026-05-28: codex 외부 모델 교차 리뷰 도입 — High 1 + Med 4 fix 후 머지 결정 (PR 7) (`account.list._def` 만 잡고 `account.infinite` 누락한 invalidation 버그가 실 UI stale 로 이어지는 결정적 발견)
2026-05-28: settings 의 household.list + settings.overview 2호출은 의식적 예외 — 묶지 않음 (의미/캐시 수명 다름, 백엔드 추가 변경 회피)
2026-05-28: household list 페이징 정책 — cursor 봉투 형식 유지 + `HOUSEHOLD_LIST_LIMIT=200` unbounded (가계부는 사용자당 수십개 이내, switcher 는 한번에 표시 필요, infinite 는 over-engineering)

2026-05-31: 가계부×자산 통합 범위 — 총자산만 (부채/순자산 안 함) — 복잡도 축소, 빚 따로 관리. 나중에 확장 시 스냅샷 스키마 재작업 필요
2026-05-31: 평단 방식 — 이동평균 유지 (lot/cost basis 안 만듦) — codex 권고, MVP에 lot은 과함. 매도행에 실현손익 박제로 충분
2026-05-31: MVP를 R1으로 축소 — 자동박제+전월대비증감만 1차 릴리스. 나머지(원인분해/실현손익/계좌별리포트/drill-down)는 R2~로 — codex "데이터모델 신뢰도 먼저, 기능 확장은 그 다음"
2026-05-31: 디자인 audit는 R1 화면 확정 후 별도 트랙 — R1이 /wealth 화면을 바꾸므로 미리 audit하면 재작업

2026-06-01: R4 계좌 추이 차트 데이터 소스 — 종목 합산(valueHistoryByAccount) 대신 통장 전체 자산(account_snapshot balance) (hero "통장 전체 자산"과 일치 + 현금 포함이 사용자 직관에 맞음. valueHistoryByAccount API는 남겨둠)
2026-06-01: R4 차트 = drill-down/표 없이 라인차트만 — 계좌=통장 전체 추이 / 종목=평가액 추이로 역할 분리 (사용자: 깔끔하게 차트만. R2 월클릭 분해는 자산 메인에만)
2026-06-01: 일반통장 상세도 R4 차트 적용 — account-report-section 월별 내역 표를 잔액 추이 차트로 교체 (모든 통장 상세에서 일관된 추이 UX)
2026-06-01: recharts SSR 대응 — useSyncExternalStore 마운트 가드로 클라 전용 렌더 (dynamic ssr:false 대신. set-state-in-effect lint 회피 + hydration-safe)

2026-06-01: R5a asset_class 2축 분리 — market(거래소) 유지 + asset_class(자산성격) 신규 축 (1축이면 금ETF를 COMMODITY 분류 시 market을 OTHER로 바꿔 야후갱신 끊김 딜레마. 2축은 갱신=market·분류=asset_class 독립. codex 검증)
2026-06-01: 부동산·연금 모델 — ManualAsset 신규 도메인 + 전용계좌(REAL_ESTATE/PENSION) roll-up (PortfolioItem은 market/qty/avg_price가 부동산에 안 맞음. 전용계좌 roll-up하면 총자산·추이 자동 반영. codex D1=B)
2026-06-01: 월별 배분추이 — asset_class_snapshots 전용 테이블 (account_snapshot은 계좌총액만 저장해 asset_class 슬라이스 재구성 불가. codex "aggregation loss")
2026-06-01: R5a 전체 한 사이클 + 단계 커밋 — R5a-1/2/3 순차, 마이그레이션 A/B/C 독립 (사용자: 전체 한번에. 단 스냅샷 의미변경을 모델 마이그레이션에 묻지 말 것 — codex)
2026-06-01: asset_class 백필 — 전부 STOCK 기본값 + UI에서 사용자 재분류 (금을 code/name LIKE로 SQL 추측 UPDATE 안 함)

2026-06-01: R5b 트랙② 차트 라이브러리 — Mantine Charts(@mantine/charts) 채택 (Mantine v8 테마 자동 통합으로 "촌스러움" 근본 해결, escape hatch(tooltipProps/areaChartProps)로 Recharts 자유도 유지, h prop으로 SSR 마운트 가드 제거. 같은 Recharts 엔진이라 Recharts 직접 스타일링의 상위호환. Nivo/ECharts/visx는 엔진교체 공수·번들 과함으로 컷)
2026-06-01: R5b 트랙② 브랜드명 — "모음" 한글 브랜드 (자산을 모은다는 직관적·동사적 의미. 가계부→자산추적 정체성 전환)
2026-06-01: R5b 트랙② 레이아웃 — 자산중심 전면 재편 4탭(자산=홈 / 투자=/invest / 거래 / 내정보) (홈↔자산 hero 중복·투자 이원화·자산화면 과밀 해소. portfolio→invest 승격, wealth는 상세 sub-route 잔존)
2026-06-01: R5b 트랙② 시각 결정 방식 — design-shotgun 시안 비교 후 DESIGN.md (사용자가 시안 보고 무드 선택. "해답 알고있다" 가정 없이 상의)

2026-06-02: 매매손익 종목→계좌 IA 이동 — 종목상세 "매매손익" 탭 제거, 계좌상세 "누적 매매수익"으로 이동 (전량매도 시 종목 soft delete로 그 종목 실현손익 조회 사각지대. 매도 거래는 ACTIVE 보존이라 계좌에서 재집계 가능 — 사라진 종목 성과까지 추적. 새 컬럼/마이그레이션 없이 realized_pnl 박제값 재활용)
2026-06-02: 누적 매매수익 UI — 도넛 하단 "레일" + 바텀시트 (codex 옵션①. "도넛=지금 보유 / 레일=팔고 지나간 성과" 대비. 무거운 풀 패널→얇은 한 줄 레이어, 탭하면 시트로 상세)
2026-06-02: 매매손익 기간 = 날짜 자유 선택 — 프리셋(1·3개월/1년) 폐기, 시작일/종료일 DateInput+달력 (사용자: 년/월/일 자유 선택. 백엔드 fromDate/toDate 그대로 활용)
2026-06-02: 계좌상세 hero 대표값 = "계좌 총액" 라벨 명확화 (codex #2: 메인 "투자 평가액"과 의미가 달라 혼란 → 총액 유지하되 라벨 명확, pill=평가손익)
2026-06-02: 카드 박스 구분 = 테두리 (배경색은 유지) — 배경 진하게(#ece2ce)+그림자 강화 시도했으나 사용자가 색 원복 요청 → Card withBorder+웜그레이(gray.2) 테두리로 경계만. 배경 #faf6ef 유지

2026-06-03: running balance 머지 전 4소스 교차 리뷰 — 커밋 한정(fastapi-reviewer+code-reviewer) + 소스 전체(codex 양레포 정독) (커밋만 보면 못 잡는 평단·매매손익날짜·보안 결함을 전체 스캔이 major 6개 신규 발견. 두 방식 상보적 — 커밋리뷰는 running balance 본체, 전체스캔은 주변 회귀)
2026-06-03: 포트폴리오 평단 = 시간순 replay 통합 — 단순 가중평균(전체매수합/매수량) 폐기 (매도 후 재매수 시 매도차감원가 미반영해 평단 왜곡: 10@100→5매도→5@200이 133.33 오산, 정답 150. _recompute_realized_pnl의 이동평균 replay가 최종 보유수량·원가 반환하게 해 재사용 — realized_pnl 재박제와 같은 로직 공유로 중복 제거)
2026-06-03: i18n 통화 표기 = 로케일별 자연스럽게 — ko "1,000원"(suffix) / en "₩1,000"(prefix) (Intl currency KRW는 ko도 "₩1,000"이라 한국어 '원' 친숙성 안 맞음. `general.money` ICU로 분기 — useMoney 훅이 fmt+통화 일괄. 사용자: 각 로케일 관습에 맞춤)
2026-06-03: 로고 = 겹치는 세 원 → 중앙 핵 수렴(B안) — ㅁ상자+코인(A)·워드마크 "모"(C) 탈락 (codex는 16px 식별성으로 C 추천했으나 사용자가 B 선택. "여러 자산이 한곳으로 모임" 컨셉이 브랜드명 '모음'과 직결)
2026-06-03: i18n 대량 치환 = 인프라 메인 선작업 → 컴포넌트 서브에이전트 병렬 (ko/en.json 단일파일 동시편집이 병렬 충돌 원인. 헬퍼·공통키는 메인이 먼저, 컴포넌트 치환만 파일별 병렬 위임=json read-only라 안전. 같은 NS 신설 필요한 개별텍스트는 단독 agent 순차)
2026-06-03: favicon = app/icon.svg 단일 정본 — metadata.icons.icon "/icon.svg" 수동지정 제거 (Next14가 app/icon.svg를 /icon.svg 라우트로 자동 등록하는데 metadata에 같은 경로 지정 시 충돌→500. 컨벤션 우선)
2026-08-22: 프로젝트 이름 정리 범위 — `household` → `moeum` 을 4레이어로 쪼개 B(문서·주석)·C(디렉토리·레포명)만 실행, D·E 보류 (레포·디렉토리·README/CLAUDE.md·`package.json` name 까지만. `package.json` 은 `private: true` + lockfile·코드 참조 0 이라 D 로 분류했다가 안전 확인 후 포함. 반대로 `docker-compose.yml` 의 `household-net`·`BACKEND_URL: http://household-back:8000` 과 `nginx.conf` 의 `household.jinho826.com` 은 백엔드 컨테이너/도메인과 짝이라 한쪽만 바꾸면 즉시 깨져 D 로 남김. i18n 의 `household`/"가계부" 키는 브랜드명이 아니라 도메인 개념이라 E)
