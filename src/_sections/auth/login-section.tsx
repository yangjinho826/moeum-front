"use client";

import { Button, PasswordInput, Stack, Text, TextInput } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import BrandLogo from "_features/auth/components/brand-logo";
import { useAuthMutations } from "_features/auth/queries/use-mutations";
import BrandWordmark from "_features/layout/components/brand-wordmark";
import { isValidEmail } from "_utilities/email";

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
      email: (value) => (isValidEmail(value.trim()) ? null : t("email_format_message")),
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
        <BrandWordmark size={28} as="h1" />
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
          // 비밀번호 관리자가 계정 필드로 알아보게
          autoComplete="username"
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
