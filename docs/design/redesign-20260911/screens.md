화면 수: 28

| ID | 라우트 | 우선순위 | 배치 | 상태조건 | node-id | 커밋 | shot |
|---|---|---|---|---|---|---|---|
| home | / | P1 | 1 | 로그인·uitest 데이터 · 390/1440 | 10:3 | c54b069 | home.jpg·home-desktop.jpg |
| invest | /invest | P1 | 1 | 로그인·uitest 데이터 · 390/1440 | 25:179 | 45d29ab | invest.jpg·invest-desktop.jpg |
| settings | /settings | P1 | 1 | 로그인·uitest 데이터 · 390/1440 | 27:257 | a45b06b | settings.jpg·settings-desktop.jpg |
| transactions | /transactions | P1 | 1 | 로그인·uitest 데이터 · 390/1440 | 22:90 | 53b0cfe | transactions.jpg·transactions-desktop.jpg·transactions-calendar.jpg |
| invest/account/[accountId] | /invest/account/[accountId] | P1 | 2 | 로그인·uitest 데이터 · 390/1440 | 41:365 | 463b05a | invest-account.jpg·invest-account-desktop.jpg |
| invest/portfolio/[portfolioId] | /invest/portfolio/[portfolioId] | P1 | 2 | 로그인·uitest 데이터 · 390/1440 | 45:130 | f499775 | invest-portfolio.jpg·invest-portfolio-desktop.jpg |
| transactions/new | /transactions/new | P1 | 2 | 로그인·uitest 데이터 · 390/1440 | 46:451 | 03e493f | transactions-new.jpg(시트 · 데스크톱 모달 560 DOM 실측) |
| wealth | /wealth | P1 | 2 | 로그인·uitest 데이터 · 390/1440 | 46:195 | c501efc | wealth.jpg·wealth-desktop.jpg |
| account | /account | P2 | 3 | → /wealth 리다이렉트(배치3 S3 사용자 결정 — 들어오는 링크 0, 자산 화면 통장 섹션과 중복) | ⏭ | d50f0b4 | ⏭ |
| account/[accountId] | /account/[accountId] | P2 | 3 | 로그인·uitest 데이터 · 390/1440 | 58:383 | 67340e3 | account-detail.jpg·account-detail-desktop.jpg |
| account/[accountId]/edit | /account/[accountId]/edit | P2 | 3 | 로그인·uitest 데이터 · 390/1440 | 60:249 | e06f89f | account-edit.jpg(시트 · 삭제 좌측) |
| account/new | /account/new | P2 | 3 | 로그인·uitest 데이터 · 390/1440 | 60:77 | e06f89f | account-new-desktop.jpg(페이지 모드 560) |
| category | /category | P2 | 4 | 로그인·uitest 데이터 · 390/1440 | 67:1013 | 1d41c0e·07c7332 | category.jpg·category-desktop.jpg |
| category/[categoryId] | /category/[categoryId] | P2 | 4 | 로그인·uitest 데이터 · 390/1440 | 67:1172 | 07c7332·fe62426 | category-sheet.jpg |
| category/new | /category/new | P2 | 4 | 로그인·uitest 데이터 · 390/1440 | 67:1061 | fe62426·07c7332 | category-new-desktop.jpg |
| fixed | /fixed | P2 | 4 | 로그인·uitest 데이터 · 390/1440 | 67:1285 | a0b6f03·87002da | fixed.jpg·fixed-desktop.jpg |
| fixed/[fixedId] | /fixed/[fixedId] | P2 | 5 | 로그인·uitest 데이터 · 390/1440 | 73:406 | cca6ce4·4f5e693 | fixed-sheet-edit.jpg |
| fixed/new | /fixed/new | P2 | 5 | 로그인·uitest 데이터 · 390/1440 | 73:297 | cca6ce4·4f5e693 | fixed-sheet.jpg·fixed-new-desktop.jpg |
| household | /household | P2 | 5 | 로그인·uitest 데이터 · 390/1440 | 73:517 | f864585·4f5e693 | household.jpg·household-desktop.jpg |
| household/new | /household/new | P2 | 5 | 로그인·uitest 데이터 · 390/1440 | 73:541 | 1690b7f | household-sheet.jpg·household-new-desktop.jpg |
| household/[householdId] | /household/[householdId] | P2 | 6 | 로그인·uitest 데이터 · 390/1440 | | | |
| household/[householdId]/members | /household/[householdId]/members | P2 | 6 | 로그인·uitest 데이터 · 390/1440 | | | |
| login | /login | P2 | 6 | 비로그인 · 390/1440 | | | |
| register | /register | P2 | 6 | 비로그인 · 390/1440 | | | |
| invest/[portfolioId] | /invest/[portfolioId] | P2 | 7 | 로그인·uitest 데이터 · 390/1440 | | | |
| invest/new | /invest/new | P2 | 7 | 로그인·uitest 데이터 · 390/1440 | | | |
| onboarding/household | /onboarding/household | P2 | 7 | 로그인·가계부 0개 · 390 | | | |
| transactions/[transactionId] | /transactions/[transactionId] | P2 | 7 | 로그인·uitest 데이터 · 390/1440 | | | |

배치: 1 = 셸(헤더·탭바·사이드바·기록 진입점) + 4탭 메인 · 2 = 핵심 상세·기록(자산 상세·투자 계좌·종목·거래 기록 폼=QuickAddSheet 정본, 라우트는 fallback) · 3~7 = P2 관리·게스트. 배치 ≤4 화면.
