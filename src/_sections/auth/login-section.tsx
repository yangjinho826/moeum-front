"use client";

import { Button, PasswordInput, Stack, Text, TextInput } from "@mantine/core";
import { isEmail, isNotEmpty, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import BrandLogo from "_features/auth/components/brand-logo";
import { useAuthMutations } from "_features/auth/queries/use-mutations";

/**
 * 로그인 (plan/6.md, Figma 77:147) — 한 칼럼 명세서: 로고 → 워드마크 → 태그라인 → 필드 → 버튼.
 * 카드·그림자·그라데이션 없음. 회원가입 링크는 베타 차단(37348a0) — 가입은 URL 직접 진입만.
 */
export default function LoginSection() {
  const t = useTranslations("auth");
  const tg = useTranslations("general.common");
  const router = useRouter();
  const params = useParams<{ locale: string }>();

  const { loginMutation } = useAuthMutations({
    onLoginError: (error) => {
      notifications.show({
        title: tg("notificationstitle"),
        message: error.errorMessage ?? t("login_failed"),
        color: "danger",
      });
    },
  });

  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: isEmail(t("email_format_message")),
      password: isNotEmpty(t("password_required_message")),
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    try {
      await loginMutation.mutateAsync(values);
      notifications.show({
        title: tg("notificationstitle"),
        message: t("login_success"),
        color: "positive",
      });
      router.push(`/${params.locale}`);
    } catch {
      // onLoginError 에서 처리됨
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <Stack gap={12} align="flex-start">
        <BrandLogo size={40} />
        {/* 워드마크 = accent 800(DESIGN §5 셸) — Mantine Text 기본 굵기·색이 클래스보다 우선이라 props 로 */}
        <Text
          component="h1"
          fw={800}
          c="var(--moeum-accent)"
          style={{ fontSize: 28, lineHeight: "36px", letterSpacing: "-0.03em", margin: 0 }}
        >
          {t("brand_name")}
        </Text>
        <Text c="dimmed" style={{ fontSize: 15, lineHeight: "23px", wordBreak: "keep-all" }}>
          {t("brand_tagline")}
        </Text>
      </Stack>

      {/* 간격 14 — 폼 공통 리듬 (DESIGN §5) */}
      <Stack gap={14} mt={32}>
        <TextInput
          {...form.getInputProps("email")}
          label={t("email")}
          placeholder={t("email_placeholder")}
          type="email"
          autoComplete="email"
        />
        <PasswordInput
          {...form.getInputProps("password")}
          label={t("password")}
          placeholder={t("password_placeholder")}
          autoComplete="current-password"
        />
      </Stack>
      <Button type="submit" fullWidth size="lg" mt={24} loading={loginMutation.isPending}>
        {t("login_submit")}
      </Button>
    </form>
  );
}
