# moeum-front

스택: `personal-frontend`

<!-- BEGIN claude-init managed: rules -->
## 적용 룰

<!-- 글로벌 룰은 ~/.claude/lazy-rules/ (@import 로 로드 — 디렉토리 자동 로드 X), 외부 룰은 ~/.claude-rules-store/ (@import 로만 로드). claude-init 이 자동 생성/갱신 -->

<!-- common -->
@~/.claude/lazy-rules/common/README.md
@~/.claude/lazy-rules/common/coding.md
@~/.claude/lazy-rules/common/git.md
@~/.claude/lazy-rules/common/style.md

<!-- javascript -->
@~/.claude/lazy-rules/javascript/README.md
@~/.claude/lazy-rules/javascript/style.md

<!-- typescript -->
@~/.claude/lazy-rules/typescript/README.md
@~/.claude/lazy-rules/typescript/strict.md
@~/.claude/lazy-rules/typescript/style.md

<!-- typescript-react -->
@~/.claude/lazy-rules/typescript-react/README.md
@~/.claude/lazy-rules/typescript-react/general.md
@~/.claude/lazy-rules/typescript-react/state.md
@~/.claude/lazy-rules/typescript-react/testing.md

<!-- typescript-nextjs -->
@~/.claude/lazy-rules/typescript-nextjs/README.md
@~/.claude/lazy-rules/typescript-nextjs/app-router.md
@~/.claude/lazy-rules/typescript-nextjs/data-fetching.md
@~/.claude/lazy-rules/typescript-nextjs/server-actions.md
@~/.claude/lazy-rules/typescript-nextjs/server-components.md

<!-- personal-frontend -->
@~/.claude-rules-store/personal-frontend/README.md
@~/.claude-rules-store/personal-frontend/general.md

<!-- END claude-init managed: rules -->

## 빌드/실행

```bash
pnpm install
pnpm dev              # http://localhost:3000
pnpm build
pnpm start
pnpm lint
pnpm typecheck
pnpm test
```

shadcn 컴포넌트 추가:
```bash
pnpm dlx shadcn@latest add <component>
```

## 프로젝트 메모

<!-- 예시:
- Next.js 15 (App Router) + React 19 + TypeScript strict
- UI: shadcn/ui + Radix + Tailwind 3 + lucide-react + sonner
- 상태: TanStack Query 5 + Zustand 5
- 폼: react-hook-form + Zod
- i18n: next-intl (app/[locale]/...)
- 인증: 3-쿠키 (ACCESS/REFRESH/SESSION) + Server Component 가드
- 표준 참조 모듈: src/features/admin/
-->

## Design System
UI·시각 결정 전에 항상 `DESIGN.md` 를 먼저 읽는다.
폰트·색·간격·라운드·미학 방향은 전부 거기에 정의돼 있다. 사용자 승인 없이 벗어나지 않는다.
QA 모드에서는 DESIGN.md 와 다른 코드를 지적한다.
