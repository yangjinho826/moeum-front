화면 수: 28

| ID | 라우트 | 우선순위 | 배치 | 상태조건 | node-id | 커밋 | shot |
|---|---|---|---|---|---|---|---|
| home | / | P1 | 1 | 로그인·uitest 데이터 · 390/1440 | 10:3 | c54b069 | home.jpg·home-desktop.jpg |
| invest | /invest | P1 | 1 | 로그인·uitest 데이터 · 390/1440 | 25:179 | 45d29ab | invest.jpg·invest-desktop.jpg |
| settings | /settings | P1 | 1 | 로그인·uitest 데이터 · 390/1440 | 27:257 | a45b06b | settings.jpg·settings-desktop.jpg |
| transactions | /transactions | P1 | 1 | 로그인·uitest 데이터 · 390/1440 | 22:90 | 53b0cfe | transactions.jpg·transactions-desktop.jpg·transactions-calendar.jpg |
| invest/account/[accountId] | /invest/account/[accountId] | P1 | 2 | 로그인·uitest 데이터 · 390/1440 | | | |
| invest/portfolio/[portfolioId] | /invest/portfolio/[portfolioId] | P1 | 2 | 로그인·uitest 데이터 · 390/1440 | | | |
| transactions/new | /transactions/new | P1 | 2 | 로그인·uitest 데이터 · 390/1440 | | | |
| wealth | /wealth | P1 | 2 | 로그인·uitest 데이터 · 390/1440 | | | |
| account | /account | P2 | 3 | 로그인·uitest 데이터 · 390/1440 | | | |
| account/[accountId] | /account/[accountId] | P2 | 3 | 로그인·uitest 데이터 · 390/1440 | | | |
| account/[accountId]/edit | /account/[accountId]/edit | P2 | 3 | 로그인·uitest 데이터 · 390/1440 | | | |
| account/new | /account/new | P2 | 3 | 로그인·uitest 데이터 · 390/1440 | | | |
| category | /category | P2 | 4 | 로그인·uitest 데이터 · 390/1440 | | | |
| category/[categoryId] | /category/[categoryId] | P2 | 4 | 로그인·uitest 데이터 · 390/1440 | | | |
| category/new | /category/new | P2 | 4 | 로그인·uitest 데이터 · 390/1440 | | | |
| fixed | /fixed | P2 | 4 | 로그인·uitest 데이터 · 390/1440 | | | |
| fixed/[fixedId] | /fixed/[fixedId] | P2 | 5 | 로그인·uitest 데이터 · 390/1440 | | | |
| fixed/new | /fixed/new | P2 | 5 | 로그인·uitest 데이터 · 390/1440 | | | |
| household | /household | P2 | 5 | 로그인·uitest 데이터 · 390/1440 | | | |
| household/new | /household/new | P2 | 5 | 로그인·uitest 데이터 · 390/1440 | | | |
| household/[householdId] | /household/[householdId] | P2 | 6 | 로그인·uitest 데이터 · 390/1440 | | | |
| household/[householdId]/members | /household/[householdId]/members | P2 | 6 | 로그인·uitest 데이터 · 390/1440 | | | |
| login | /login | P2 | 6 | 비로그인 · 390/1440 | | | |
| register | /register | P2 | 6 | 비로그인 · 390/1440 | | | |
| invest/[portfolioId] | /invest/[portfolioId] | P2 | 7 | 로그인·uitest 데이터 · 390/1440 | | | |
| invest/new | /invest/new | P2 | 7 | 로그인·uitest 데이터 · 390/1440 | | | |
| onboarding/household | /onboarding/household | P2 | 7 | 로그인·가계부 0개 · 390 | | | |
| transactions/[transactionId] | /transactions/[transactionId] | P2 | 7 | 로그인·uitest 데이터 · 390/1440 | | | |

배치: 1 = 셸(헤더·탭바·사이드바·기록 진입점) + 4탭 메인 · 2 = 핵심 상세·기록(자산 상세·투자 계좌·종목·거래 기록 폼=QuickAddSheet 정본, 라우트는 fallback) · 3~7 = P2 관리·게스트. 배치 ≤4 화면.
