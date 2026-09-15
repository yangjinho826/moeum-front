import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  createTheme,
  Drawer,
  InputWrapper,
  Switch,
  Modal,
  Notification,
  NumberInput,
  PasswordInput,
  rem,
  SegmentedControl,
  Select,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";

import {
  danger,
  darkScale,
  grayScale,
  info,
  positive,
  purple,
  sage,
  SURFACE,
  terracotta,
  warning,
} from "./palette";

// ============================================================
// 색상 시스템 — Statement · Warm (DESIGN.md §2)
// 행동 = sage. 가계부 = positive(수입)/terracotta(지출).
// 자산 방향(한국식) = up(상승·매수·증가 = danger 튜플 별칭) / down(하락·매도·감소 = info 별칭).
// 에러·삭제 = danger, 주의 = warning, 이체 = purple.
// 셰이드는 항상 명시(`positive.5`) — 라이트 base 와 다크 base 가 다르므로
// 스킴별 값이 필요한 곳은 `var(--moeum-income)` 같은 CSS 변수를 우선 쓴다.
// ============================================================

const INPUT_HEIGHT = rem(44);

/** filled + 기본색(sage) 일 때만 accent 위 텍스트색을 강제 — 다크 sage.4 위 흰 글자는 대비 미달 */
function isAccentFilled(variant: string | undefined, color: unknown): boolean {
  return (variant ?? "filled") === "filled" && (color === undefined || color === "sage");
}

const inputVars = () => ({
  wrapper: {
    "--input-height": INPUT_HEIGHT,
    "--input-bg": "var(--moeum-surface-2)",
  },
});

export const mantineTheme = createTheme({
  primaryColor: "sage",
  // 라이트 7 = --moeum-accent(sage.7) 와 같게 — filled 버튼과 링크가 같은 색 (H-1, 흰 글자 대비 6.69)
  primaryShade: { light: 7, dark: 4 },
  autoContrast: true,

  white: SURFACE.light.surface,
  black: SURFACE.light.text,

  fontFamily:
    '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  // 금액·날짜·라벨 = Geist Mono (base-layout 에서 로드)
  fontFamilyMonospace:
    '"Geist Mono", ui-monospace, "SF Mono", Menlo, monospace',
  defaultRadius: "md",

  colors: {
    sage,
    terracotta,
    positive,
    danger,
    warning,
    info,
    purple,
    up: danger,
    down: info,
    gray: grayScale,
    dark: darkScale,
  },

  spacing: {
    xs: rem(4),
    sm: rem(8),
    md: rem(12),
    lg: rem(16),
    xl: rem(24),
    "2xl": rem(32),
    "3xl": rem(48),
    "4xl": rem(64),
  },

  radius: {
    xs: rem(2),
    sm: rem(4),
    md: rem(8),
    lg: rem(12),
    xl: rem(16),
    "2xl": rem(20),
    "3xl": rem(24),
    full: rem(9999),
  },

  // 명세서 무드 — 카드·그림자 없음. Modal/Drawer 만 무채색 그림자
  shadows: {
    xs: "0 1px 2px rgba(0, 0, 0, 0.06)",
    sm: "0 2px 6px rgba(0, 0, 0, 0.08)",
    md: "0 6px 16px rgba(0, 0, 0, 0.12)",
    lg: "0 12px 28px rgba(0, 0, 0, 0.18)",
    xl: "0 20px 40px rgba(0, 0, 0, 0.24)",
  },

  fontSizes: {
    xs: rem(12),
    sm: rem(13),
    md: rem(15),
    lg: rem(20),
    xl: rem(28),
  },

  lineHeights: {
    xs: "1.4",
    sm: "1.5",
    md: "1.5",
    lg: "1.4",
    xl: "1.35",
  },

  headings: {
    fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
    fontWeight: "800",
    sizes: {
      h1: { fontSize: rem(28), lineHeight: "1.2", fontWeight: "800" },
      h2: { fontSize: rem(22), lineHeight: "1.3", fontWeight: "800" },
      h3: { fontSize: rem(18), lineHeight: "1.35", fontWeight: "700" },
      h4: { fontSize: rem(14), lineHeight: "1.4", fontWeight: "700" },
    },
  },

  components: {
    Button: Button.extend({
      defaultProps: {
        radius: "md",
        size: "md",
      },
      // size별 정확한 픽셀 강제 (36/44/52)
      vars: (_theme, props) => {
        const sizes = {
          sm: { h: rem(36), px: rem(16), fz: rem(13) },
          md: { h: rem(44), px: rem(20), fz: rem(15) },
          lg: { h: rem(52), px: rem(24), fz: rem(15) },
        } as const;
        const sizeKey =
          typeof props.size === "string" && props.size in sizes
            ? (props.size as keyof typeof sizes)
            : "md";
        const config = sizes[sizeKey];
        return {
          root: {
            "--button-height": config.h,
            "--button-padding-x": config.px,
            "--button-fz": config.fz,
            ...(isAccentFilled(props.variant, props.color)
              ? { "--button-color": "var(--moeum-on-accent)" }
              : {}),
            // outline(보조) = 투명 + hair 테두리 + 본문색 (DESIGN.md §5 버튼, Figma Button Outline 20:112)
            ...(props.variant === "default"
              ? {
                  "--button-bg": "transparent",
                  "--button-hover": "var(--moeum-surface-2)",
                  "--button-bd": "1px solid var(--moeum-hair)",
                  "--button-color": "var(--moeum-text)",
                }
              : {}),
          },
        };
      },
      styles: {
        root: {
          letterSpacing: "-0.02em",
          fontWeight: 700,
        },
      },
    }),
    Card: Card.extend({
      // 명세서 룩은 Card 를 쓰지 않는다(Section 컴포넌트). 이관 전 화면이 깨지지 않게 표면만 맞춘다.
      defaultProps: {
        radius: "md",
        padding: "lg",
        withBorder: true,
      },
      styles: {
        root: {
          letterSpacing: "-0.02em",
          background: "var(--moeum-surface)",
          borderColor: "var(--moeum-hair)",
        },
      },
    }),
    Container: Container.extend({
      defaultProps: {
        px: 0,
      },
    }),
    Title: Title.extend({
      styles: {
        root: {
          letterSpacing: "-0.03em",
        },
      },
    }),
    Text: Text.extend({
      defaultProps: {
        size: "md",
      },
      styles: {
        root: {
          letterSpacing: "-0.01em",
        },
      },
    }),
    // 폼 필드 라벨 = 보조 13/500 dim, 필드와 6 간격. 설명(description)은 12 로 라벨보다 작게.
    // (배치2 S5 에서 11 로 했다가 "라벨이 설명보다 작아 안 보임" 피드백으로 13 — 모든 인풋 공통)
    InputWrapper: InputWrapper.extend({
      styles: {
        label: {
          fontSize: rem(13),
          lineHeight: rem(19),
          fontWeight: 500,
          color: "var(--moeum-text-dim)",
          marginBottom: rem(6),
        },
        description: {
          fontSize: rem(12),
          lineHeight: rem(17),
          marginBottom: rem(6),
        },
      },
    }),
    // 스위치 라벨도 폼 필드 라벨과 같은 13/500 dim, 설명 12 (배치5 고정지출 "보관" — 앱의 첫 Switch)
    // 설정 행 모양 — 라벨·설명 좌, 스위치 우 끝 (배치5 S6: 호출부마다 달라지지 않게 테마에서)
    Switch: Switch.extend({
      defaultProps: { labelPosition: "left" },
      styles: {
        // 라벨·설명까지 누를 수 있는 영역 44 이상(DESIGN §4 터치 타깃)
        body: { minHeight: rem(44), alignItems: "center", justifyContent: "space-between", gap: rem(12) },
        labelWrapper: { flex: 1 },
        label: { fontSize: rem(13), lineHeight: rem(19), fontWeight: 500, color: "var(--moeum-text-dim)" },
        description: { fontSize: rem(12), lineHeight: rem(17) },
      },
    }),
    TextInput: TextInput.extend({
      defaultProps: { variant: "filled", size: "md", radius: "md" },
      vars: inputVars,
      styles: { input: { letterSpacing: "-0.01em" } },
    }),
    PasswordInput: PasswordInput.extend({
      defaultProps: { variant: "filled", size: "md", radius: "md" },
      vars: () => ({ ...inputVars(), root: {} }),
      styles: { input: { letterSpacing: "-0.01em" } },
    }),
    NumberInput: NumberInput.extend({
      defaultProps: {
        variant: "filled",
        size: "md",
        radius: "md",
        hideControls: true,
        thousandSeparator: ",",
      },
      vars: () => ({ ...inputVars(), controls: {} }),
      styles: {
        input: {
          fontFamily: "var(--mantine-font-family-monospace)",
          fontVariantNumeric: "tabular-nums",
        },
      },
    }),
    Select: Select.extend({
      defaultProps: {
        variant: "filled",
        size: "md",
        radius: "md",
        // 드롭다운이 넘치면 스크롤바 상시 표시 — 기본 "scroll" 은 스크롤 중에만 보여 뒤 항목이 있는지 모름
        scrollAreaProps: { type: "auto" },
      },
      vars: inputVars,
      styles: { input: { letterSpacing: "-0.01em" } },
    }),
    Textarea: Textarea.extend({
      defaultProps: { variant: "filled", size: "md", radius: "md" },
      vars: () => ({ wrapper: { "--input-bg": "var(--moeum-surface-2)" } }),
      styles: { input: { letterSpacing: "-0.01em" } },
    }),
    DateInput: DateInput.extend({
      defaultProps: {
        variant: "filled",
        size: "md",
        radius: "md",
        // 바텀시트(Drawer) 안에서 달력 popover 가 컨테이너에 잘리던 문제 →
        // 포털로 body 직속 렌더 + Drawer(zIndex 200) 위로 올림 (거래 추가/매매 폼 공통)
        popoverProps: { withinPortal: true, zIndex: 1100 },
      },
      vars: inputVars,
    }),
    Modal: Modal.extend({
      defaultProps: {
        centered: true,
        radius: "lg",
        padding: "lg",
      },
      // content/header 기본이 body 색이라 페이지와 같아짐 → 표면색으로
      styles: {
        content: { background: "var(--moeum-surface)" },
        header: { background: "var(--moeum-surface)" },
      },
    }),
    Drawer: Drawer.extend({
      styles: {
        content: { background: "var(--moeum-surface)" },
        header: { background: "var(--moeum-surface)" },
      },
    }),
    SegmentedControl: SegmentedControl.extend({
      defaultProps: {
        radius: "md",
      },
      // 기본(size 미지정) = 높이 44 — 트랙 패딩 4 + 라벨 8·20·8 + 4. Mantine sm 은 ~34 라 터치 타깃 미달(배치3 H-301).
      // size 를 직접 준 곳(거래 화면 헤더 보기 전환 xs)은 Mantine 기본 그대로
      vars: (_theme, props) => ({
        root: props.size === undefined ? { "--sc-padding": `${rem(8)} ${rem(14)}` } : {},
      }),
      // 다크 기본(track dark-8 / indicator dark-5)이 surface-2 근처로 겹쳐 인디케이터가 안 보임
      styles: (_theme, props) => ({
        root: { background: "var(--moeum-surface-2)" },
        indicator: { background: "var(--moeum-surface)" },
        label: props.size === undefined ? { lineHeight: rem(20) } : {},
      }),
    }),
    Notification: Notification.extend({
      defaultProps: {
        radius: "md",
        withBorder: false,
      },
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: {
        radius: "md",
        variant: "subtle",
      },
      vars: (_theme, props) => ({
        root: isAccentFilled(props.variant ?? "subtle", props.color)
          ? { "--ai-color": "var(--moeum-on-accent)" }
          : {},
      }),
    }),
    Badge: Badge.extend({
      defaultProps: {
        radius: "sm",
      },
      styles: {
        root: {
          letterSpacing: "0",
          fontWeight: 600,
        },
      },
    }),
  },
});
