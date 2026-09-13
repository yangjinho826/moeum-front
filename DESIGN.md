# DESIGN.md — 모음 디자인 시스템 (Statement · Warm)

> 가계부 × 투자자산 통합 앱 "모음"의 시각 시스템 정본. 2026-09-11 design-flow run `redesign-20260911` S2 에서 Warm Ledger 를 **교체**.
> 프리뷰 정본: `docs/design/redesign-20260911/preview/moeum-statement-preview.html` (D 변형 = 이 문서). 이 문서와 코드가 다르면 코드를 고친다.

## 0. 제품 컨텍스트
- **무엇**: 개인 가계부 + 투자자산을 한 곳에서. 웹(반응형, 모바일 앱처럼) → 추후 네이티브.
- **누구**: 주식·ETF 투자하는 월급쟁이 직장인(본인). 월초에 자산 확인, 가계부는 하루 한두 번.
- **10초**: 자산의 상승·하락이 한눈에 — 총자산이 지난달보다 늘었나 줄었나.
- **기억할 것**: 가계부는 수단, 자산 증식이 목적. 위계 = ① 자산이 늘었나(결과, 제일 크게) → ② 왜(순저축·투자손익) → ③ 기록·관리(도구, 조용히).
- **참고**: 토스(큰 숫자 하나 + 행 리스트) · 증권사 앱(상승=빨강) · Copilot(숫자 중심 다크) · Monarch(종이+세리프 에디토리얼).

## 1. 미학 — 명세서(Statement)
**한 줄**: 앱이 아니라 잘 조판된 은행 명세서. 따뜻한 종이 위에 등폭 숫자.

| 원칙 | 의미 |
|---|---|
| 카드 0장 | 섹션은 헤어라인 1px + 여백으로만 나눈다. 그림자·그라데이션·배경 블록 없음 |
| 숫자가 주인공 | 총자산은 카드 밖 배경 위에 44~60px 등폭. 나머지 텍스트는 15px 이하 |
| 색은 방향에만 | 행동색 1개(세이지) + 의미색 4개(수입·지출·상승·하락). 장식용 색 없음 |
| 좌제목·우금액 | 제목·라벨 좌정렬, 금액은 항상 우정렬 tabular. 가운데 정렬 없음 |
| 두 벌 | 라이트(크림) 기본, 다크(딥브라운)는 토큰 1:1. 화면 코드는 스킴을 모른다 |

**안 하는 것**: Card 컴포넌트, 그림자, 아이콘 그리드, 도넛 외 장식 차트, 세리프, 보라 계열, 둥근 pill 카드.

## 2. 컬러

### 2-1. 표면 · 텍스트 (`--moeum-*`)
| 역할 | 변수 | 라이트 | 다크 | Mantine |
|---|---|---|---|---|
| 페이지 배경 | `--moeum-bg` | `#FAF6EF` | `#1F1A16` | body / dark.7 |
| 표면(시트·모달·인풋) | `--moeum-surface` | `#FFFDF9` | `#2A241F` | white / dark.6 |
| 눌린 면(입력 filled·세그먼트 트랙) | `--moeum-surface-2` | `#F3EEE4` | `#332C26` | gray.1 / dark.5 |
| 헤어라인(섹션 구분) | `--moeum-hair` | `#DDD5C9` | `#3A322B` | gray.2 / dark.4 |
| 행 구분선(약) | `--moeum-hair-2` | `#EDE8E0` | `#2F2823` | gray.1 / dark.5 |
| 본문 | `--moeum-text` | `#3C3530` | `#F1EAE0` | gray.9 / dark.0 |
| 보조·라벨 | `--moeum-text-dim` (`c="dimmed"`) | `#7A6F63` | `#A8998A` | gray.6 / dark.2 |
| placeholder | — | `#9C8F82` | `#7A6F63` | gray.5 / dark.3 |

### 2-2. 팔레트 (Mantine 튜플, 셰이드 **항상 명시**)
| 이름 | 역할 | 라이트 base | 다크 base | 튜플 |
|---|---|---|---|---|
| `sage` (primary) | 행동: 탭 활성·버튼·링크·추이선·브랜드 | `sage.7 #4F6149` | `sage.4 #93AC85` | 기존 유지 |
| `positive` | **수입** · 잔액 양수 · 저축 | `positive.6 #266E4A` | `positive.3 #73B88E` | 기존 유지 |
| `terracotta` | **지출** · 잔액 음수 | `terracotta.7 #A4543B` | `terracotta.4 #E5B197` | 기존 유지 |
| `up` | **투자 상승 · 매수 · 총자산 증가** (한국식) | `up.7 #B91C1C` | `up.4 #F87171` | = `danger` 튜플 별칭 |
| `down` | **투자 하락 · 매도 · 총자산 감소** | `down.6 #2563EB` | `down.4 #60A5FA` | = `info` 튜플 별칭 |
| `danger` | 에러·삭제·파괴적 확인 | `#EF4444` | | 기존 |
| `warning` | 주의·임박·고정지출 태그 | `#F59E0B` | | 기존 |
| `purple` | 이체·평가조정 | `#8B5CF6` | | 기존 |
| `gray` | 웜 그레이 | 기존 튜플 | | 기존 |
| `dark` | 다크 표면 튜플(신규) | — | 0 `#F1EAE0` · 1 `#D9D0C3` · 2 `#A8998A` · 3 `#7A6F63` · 4 `#3A322B` · 5 `#332C26` · 6 `#2A241F` · 7 `#1F1A16` · 8 `#171310` · 9 `#110E0B` | 신규 |

라이트 base 는 **글자 대비 AA(4.5:1, bg `#FAF6EF`) 기준**으로 고른 셰이드다 — accent 6.21 · income 5.71 · expense 4.99 · up 6.01 · down 4.80. 이전 셰이드(sage.6 4.35 · terracotta.6 3.66 · positive.5 4.22 · danger.6 4.48)는 12~14px 링크·금액에서 미달(배치2 S6 H-1). `primaryShade` 라이트도 7 로 맞춰 filled 버튼 = accent. 다크는 전부 통과라 그대로.

`up`/`down` 은 `danger`/`info` 튜플의 **별칭**(`colors.up = danger`). 스킴별 base 셰이드가 다르므로 화면 코드는 **의미 이름 + 셰이드 대신 CSS 변수** `--moeum-accent` `--moeum-income` `--moeum-expense` `--moeum-up` `--moeum-down` 을 우선 쓴다(css-variables.ts 가 스킴별 값 발급).

### 2-3. 색 규칙 (의미 → 이름)
```
행동·활성·링크·추이선     → accent(sage)
수입 · 잔액 +             → income(positive)     지출 · 잔액 −        → expense(terracotta)
투자 상승 · 매수 · 총자산 ▲ → up(빨강)           투자 하락 · 매도 · 총자산 ▼ → down(파랑)
에러·삭제 → danger        주의 → warning         이체 → purple
보조 텍스트 → dimmed       구분 → --moeum-hair / --moeum-hair-2
```
- 색은 **금액 텍스트와 ▲▼ 부호**에만. 행 배경·아이콘 박스를 물들이지 않는다.
- 5계열(세이지·초록·테라코타·빨강·파랑)이 전부 다른 색상이라 한 화면에 섞여도 충돌 없음 — 이전 `danger` 3중 사용(지출·상승·감소)을 없애는 규칙.
- `profitColor()` → up/down. `DeltaPill variant="asset"`(up/down) / `"ledger"`(income/expense).
- **0 은 방향이 없다 → dim.** 수입·지출·고정지출 합계가 0 이면 의미색 대신 `--moeum-text-dim` (`amountColor(value, color)`, 부호 있는 값은 `signColor`). 개별 거래 행은 0 이 없어 해당 없음 (배치3 H-306).
- 알림(`notifications.show`)·확인 모달도 의미색만: 성공 `positive` · 실패·삭제 확인 `danger`. 팔레트 이름(`red`·`green`·`blue`) 금지, 매수/매도 성공도 `positive`(방향 색은 세그먼트 글자에만) (배치3 H-309).

### 2-4. 차트
| 변수 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| chart-1 | sage.7 | sage.4 | 추이선(총자산·평가액), 투자 |
| chart-2 | terracotta.7 | terracotta.4 | 현금 |
| chart-3 | text | text | 부동산 |
| chart-4 | gray.4 `#A99C8D` | dark.3 | 연금 |
| chart-5 | hair | hair | 기타·트랙 |
자산군 색은 **고정 매핑**(`ASSET_CLASS_COLOR`: 투자 1 · 현금 2 · 부동산 3 · 연금 4 · 금·적금·기타 5) — 순위로 매기면 과거 추이 색 의미가 바뀐다(배치2 S6 B-1). 종목 비중(StockShares)만 자산군이 아니라 순위(상위 4 = 1~4, 현금 5).
추이선은 1.5px 단색, 그라데이션 채움 없음, 축·그리드 없음, 마지막 점만 `up`/`down` 색 3px. 점을 탭해 상세로 가는 선(홈 총자산)만 각 점 2px `chart-1` + hover 4px `accent`. 툴팁은 surface + hair 테두리.

## 3. 타이포그래피
| 역할 | 폰트 | 크기/굵기 |
|---|---|---|
| UI · 본문 · 제목 | **Pretendard Variable** (jsdelivr, 기존) | 페이지 타이틀 22/800 · 섹션 14/700 · 본문 15/500 · 보조 13/500 · 캡션 11/500 |
| **금액 · 날짜 · % · 라벨** | **Geist Mono** (Google Fonts, 신규) `font-variant-numeric: tabular-nums` | hero 모바일 44 / 데스크톱 60, 700, `letter-spacing -0.04em` · 델타 20/600 · 행 금액 14/600 · 라벨 11/600 대문자 `letter-spacing .06em` |
- Noto Serif KR 링크 **삭제**. 한글 제목 `letter-spacing -0.03em`, 본문 -0.01em.
- "원" 은 hero 옆 14px Pretendard dimmed.
- Mantine `fontFamilyMonospace` = Geist Mono. 금액 컴포넌트는 `ff="monospace"`.

## 4. 스페이싱 · 라운드 · 엘리베이션
- 4px 베이스. 모바일 콘텐츠 좌우 20, 데스크톱 콘텐츠 40. 섹션 헤어라인 위아래 12(Figma SectionHeader 11:9 기준, 2026-09-12 S6 정정). 행 높이 46(리스트)·52(터치 주요).
- 데스크톱: 사이드바 220 + 판면 **720** + 보조 레일 **320**(gap 48). `lg` 미만은 단일 컬럼.
- 라운드: 버튼·인풋·pill 버튼 **8** · 바텀시트 상단 16 · 모달 12 · 아이콘 박스 8. 카드 없음.
- 엘리베이션: **없음**. Modal/Drawer 만 무채색 `0 20px 40px rgba(0,0,0,.24)`. FAB 은 그림자 없이 accent 단색 8px 라운드.
- 터치 타깃 44 이상(텍스트 링크·칩은 최소 32 히트영역 — 패딩+음수 마진으로 행 높이 유지, FAB 는 `::before` 로 48). 아이콘 20(내비) / 18(리스트) / 14(인라인), `@tabler/icons-react` stroke 2.
- 예외: 달력 셀 금액 10px 모노(셀 폭 ~50 에 `+1,234만` 이 들어가야 함). StatGrid 금액은 모바일 `clamp(13px, 4vw, 18px)`.

## 5. 컴포넌트 규칙
| 컴포넌트 | 규칙 |
|---|---|
| `HeroAmount` | 카드 밖. `2026.09.11 기준` 모노 캡션 → 라벨 → 큰 숫자+원 → `DeltaPill` + "지난달보다". blur 토글 옵션 |
| `Section` | `Card` 대신 사용. 상단 헤어라인 + 헤더 행(제목 14/700 · 우측 링크 accent 12/600) + children |
| `AccentLink` | accent 텍스트 링크 — `section` 12/600(섹션 헤더) · `header` 13/700(페이지·서브 헤더 "+ 추가"·"수정"). 히트 32(패딩+음수 마진). 로컬 스타일 복붙 금지 (배치2 S6) |
| 모노 라벨 | 11/16 · `.06em` 은 `className="moeum-mono moeum-label"` 한 곳(globals). 인라인 `{fontSize:11, letterSpacing}` 복붙 금지 (배치2 S6) |
| `ListRow` | 46px, 제목 15/500(Figma ListRow 11:2 기준, S6 정정) / 메타 11 dimmed, 우측 금액 모노 14/600(의미색) — 값이 글자 라벨("사용 중")이면 `valueText` 본문 서체 13/500, 행 구분 `--moeum-hair-2`, 아이콘 박스 없음(카테고리 색은 제목 앞 6px 점). 예외 = 관리 목록(카테고리·고정지출)의 `lead` — 18px 글리프(사용자가 고른 아이콘 · 카테고리 색 · stroke 2 · 장식이라 `aria-hidden`), 선택기 16개 밖 이름은 같은 자리 6px 점. 사용자 아이콘이 보이는 유일한 자리(배치4 pick A). 행 끝 보조 행동은 `action` 슬롯(멤버 "내보내기" — 행 자체가 누를 수 없을 때만, 히트 44), 선택지 중 지금 쓰는 것은 `current`(aria-current, 전환기 "사용 중") |
| `DeltaPill` | 배경 없음. `▲ 3,240,000` 모노 + 색. `asset`(up/down) / `ledger`(income/expense) |
| `StatRow` | "왜 늘었나" 2행: 제목/메타 + 우측 금액 + 2px 기여 막대(accent / up) |
| `Sparkline` | 44px, 축 없음, 1.5px 선, 마지막 점 강조(탭 가능하면 각 점 2px) |
| 필터 칩 | 활성 = accent 텍스트 + 하단 2px 언더라인(배경 채움 없음). 히트 ≥32 |
| 세그먼트 | Mantine SegmentedControl — 트랙 surface-2 + 인디케이터 surface(채움). **기본 높이 44**(테마: 라벨 8·20·8 + 트랙 4, size 미지정일 때만 — 배치3 H-301). 헤더 안 보기 전환(거래 목록/달력)만 `size="xs"` 30. 화면 전환(목록/달력·화면 모드)과 폼 선택지 3개 이하에, 필터에는 칩 (S6 D-5 결정) |
| 셸 | 모바일 헤더 48(브랜드 `BrandWordmark` accent 15/800 — 사이드바 18 · 로그인 28 · 우측 모노 기준일 · 가계부 pill) · 탭바 64(bg 배경 · 상단 hair · 활성 accent) · `＋ 기록` 8px 라운드 accent 버튼 40px(탭바 위 우측, 홈·거래 **목록 루트만** — 거래 추가·수정 페이지에선 폼을 가려서 숨김) / 데스크톱 사이드바 220(활성 = accent-soft 배경 + accent 텍스트, 하단 "기록하기") |
| 시트 · 모달 | 바텀시트 448 · 상단 16 · 핸들 40×4 hair / 데스크톱 모달 560(같은 Drawer 를 CSS `@media` 로 가운데), surface 배경, 높이는 내용에 맞춤(최대 90dvh, 넘치면 안에서 스크롤 + 푸터 sticky). 제목은 `Drawer.Title`(다이얼로그 이름). 본문 좌우 20(모바일 콘텐츠 여백과 같게, 위 12). 폼이 아닌 시트(가계부 전환기·멤버)는 취소 버튼이 없으니 제목 옆 닫기 X(18 · 히트 44, `withClose`). 로딩 자리는 행 모양 `SectionSkeleton`(70dvh 스피너는 짧은 시트를 크게 열었다 줄임). **시트가 탭바를 덮는다** — z: 헤더 30 < FAB 150 < 탭바 190 < Drawer/Modal 200 < 드롭다운 300·1100 (배치2 S6 B-3) |
| 상태 | 로딩 = `SectionSkeleton`(페이지 `hero rows={3}` · 보조 섹션 `rows`/`chart`, 실제 레이아웃 모양) · 에러 = 보조 섹션은 `SectionBoundary`(섹션 제목 + "불러오지 못했어요 · 다시 시도"), 화면 주 쿼리는 (user)/error.tsx · 빈 = `EmptyText`(문장 "~어요" + 행동 링크) |
| 폼 필드 | filled surface-2 · 높이 44 · 라운드 8. 라벨 13/500 dim(설명 12 보다 커야 함 — 배치2 S5 피드백으로 11→13), 거래 기록의 금액 한 칸만 모노 28 · 높이 56(시작 잔액·단가·수수료는 44 필드 — 배치3 H-303). 세그먼트에 `color` 채움 금지(흰 인디케이터 위 흰 글자) → 의미색은 라벨 글자에. 숫자 입력은 상태 0 이어도 빈 칸 + placeholder `0`, 단위(원·주·일)는 우측 dim 13 `InputUnit`(누르면 인풋 포커스). 선택지 3개 이하는 Select 대신 세그먼트. 색 선택 = 원 28(히트 44) · 6열 · 선택 본문색 2px 링은 box-shadow(outline 은 키보드 포커스 몫, 팔레트는 `palette.ts` `USER_COLOR_PALETTE` — 저장되는 데이터), 아이콘 선택 = 최대 8열 · 칸 44×44 이상(좁으면 열을 줄임 — 390 시트 7열, H-601) · 선택 accent-soft + accent 2px 안쪽 테두리. 묶음은 `role=group` + 라벨 연결. 비워 둘 수 있는 선택(고정지출 색·아이콘 = 카테고리 것 따름)은 고른 칸을 다시 눌러 비움. 켜고 끄는 값은 Switch(라벨 13/500 dim · 설명 12, 오른쪽 스위치 · 행 높이 44 — 테마 기본값이라 호출부에 레이아웃을 쓰지 않는다). 사용자 색이 있는 선택지(카테고리)는 Select 항목 앞 6px 색 점. 상태 안내(불러오는 중 · 없음 · 실패)는 비활성 placeholder 가 아니라 설명 줄에. 폼 필드 간격 14. 페이지 모드(fallback 라우트) 폼은 Card 없이 **앱 격자 그대로 — 좌 폼 칼럼(720) · 우 레일 `FormGuide` 도움말**(용어 뜻 · 계산 방식 · 삭제 조건, `aside`). 문구가 아직 없는 폼은 레일을 비운다. 배치3 의 "560 본문 가운데"는 목록·상세가 전부 좌 720 + 레일 320 이라 폼만 격자를 깨서 대체(배치4 사용자 피드백). 시트·모달(560)엔 도움말 없음 |
| 게스트(로그인·가입) | bg 단색 한 칼럼 448 · 좌우 20 · 위 64/120. 로고 40 → 워드마크 28(가입은 제목 22/800) → 설명 → 필드 44(간격 14) → 버튼 52 전체 폭. 카드·그림자·그라데이션 없음, 좌정렬. 가입 비밀번호 규칙(8~64자 · 영문+숫자)은 설명 줄에 미리. 이메일 검사는 백엔드와 같은 `isValidEmail` 하나 |
| 버튼 | filled = accent + `on-accent`(라이트 흰 / 다크 딥브라운), outline = hair 테두리, subtle = accent 텍스트. 높이 36/44/52. 삭제 = subtle `danger` — 폼 푸터 **좌측** auto 폭, 취소·저장과 한 줄(`FormActions`, 배치3). 글자색은 `--mantine-color-danger-text`(다크 primaryShade 4 에서 Mantine light-color 가 danger.0 로 풀림), 비활성은 배경 투명(`.moeum-remove-action`). outline 비활성(입력 전 조회·추가)도 회색 채움 대신 투명 + hair 테두리 + placeholder 글자(globals). 삭제 확인 모달은 모든 폼에서 danger + "삭제" 라벨. 기록·저장 버튼은 매수/매도여도 accent(의미색은 세그먼트 글자에만). 아이콘 버튼 히트 44 |

## 6. 모션
| 상황 | 값 |
|---|---|
| hover · 색 | 150ms ease-out |
| 행 press | 배경 `--moeum-surface-2` 즉시 |
| 시트 등장 | 220ms cubic-bezier(0.22, 1, 0.36, 1) |
| 스킴 전환 | 없음(즉시) |
바운스·패럴랙스·글로우·숫자 카운트업 없음.

## 7. 스킴 구현
- 기본 **라이트**. `ColorSchemeScript defaultColorScheme="light" localStorageKey="moeum-color-scheme"` + `localStorageColorSchemeManager`. 내정보 "화면 모드" 세그먼트(라이트/다크/시스템).
- `colors.dark` 튜플(2-2) 로 Mantine 내부 표면 자동. 우리 컴포넌트는 `--moeum-*` 만(`cssVariablesResolver` light/dark 블록).
- `postcss-preset-mantine` 없음 → `light-dark()` 금지.
- `autoContrast` 가 virtualColor 를 못 읽으므로 filled 버튼 텍스트는 `--moeum-on-accent` 강제.

## 8. 안 하는 것
- ❌ hex/rgba 하드코딩(`palette.ts` 밖) — `check-tokens.sh` 신규 위반 0
- ❌ `Card` · 그림자 · 그라데이션 · 세리프 · `TOKEN.*` · `linerGreen`
- ❌ 셰이드 생략 `c="positive"` · `theme.colors.X[n]` 정적 읽기 · `${hex}1A` 알파 합성(→ `color-mix`)
- ❌ 지출에 빨강, 수입에 파랑 (빨강/파랑은 자산 방향 전용)
- ❌ 화면 코드의 스킴 분기

## 9. 결정 로그
| 날짜 | 결정 | 이유 |
|---|---|---|
| 2026-09-11 | Warm Ledger → Statement·Warm 교체 | design-flow S2. `/design-consultation` 리서치(토스·뱅크샐러드·Copilot·Monarch) + Codex·Claude 외부 시각 합의: 카드 0장·큰 숫자·헤어라인·두 벌. 프리뷰 4변형(A 코발트 / B 라임 / C 잉크+가계부 색 / D Warm 팔레트) 중 **D** — "단색이라 별로", 기존 튜플 재사용 |
| 2026-09-11 | 의미색 5계열 분리 | `danger` 가 지출·상승·감소 3중 사용되던 충돌 제거. 수입 초록/지출 테라코타/상승 빨강/하락 파랑/행동 세이지 |
| 2026-09-11 | 금액 = Geist Mono | 자릿수 물리 정렬, "명세서" 인상. 폰트 1개 추가 로드 감수 |
| 2026-09-13 | 폼 페이지 = 좌 폼 · 우 도움말 레일 | 배치3 가운데 560 이 목록·상세의 좌 720 + 레일 320 격자와 어긋남(사용자 피드백). 레일엔 폼별 도움말 2~3항목 |
| 2026-09-13 | 관리 목록 행 앞 18px 아이콘 글리프 | 아이콘 박스를 걷으면 사용자가 고른 아이콘이 앱 어디에도 안 보임 — 카테고리·고정지출 목록만 예외(사용자 pick A) |
| 2026-09-13 | 멤버는 "초대"가 아니라 "추가" · 게스트는 카드 없는 한 칼럼 | 배치6 — 백엔드 add_household_member 는 수락 절차 없이 바로 멤버라 "초대"는 기대를 어긋나게 함. 로그인 그라데이션·그림자 카드는 §1 위반이라 명세서 한 칼럼으로 |
| 2026-09-13 | 관리 폼에서 백엔드에 없는 값은 받지 않는다 | 배치5 pick A·A·A — 고정지출 금액·가계부 통화 입력 제거(저장·계산에 안 쓰임), 가계부 목록은 소유자 행만 수정 진입(백엔드 HOUSEHOLD_NOT_OWNER). 수정에서 비우기는 막음(백엔드가 null 을 "안 바꿈"으로 받음) |
| 2026-09-13 | 선택기 칸은 열 수보다 44 히트가 먼저 | 마감 H-601 — 시트 여백 20 이후 390 에서 8열 칸이 38.5. 8열을 지키려고 칸을 줄이지 않고 auto-fill 로 열을 줄인다(넓은 화면은 8열 그대로) |
