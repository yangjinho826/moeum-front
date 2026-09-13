"use client";

import { Button, Group, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import BrandLogo from "_features/auth/components/brand-logo";
import { useAuthMutations } from "_features/auth/queries/use-mutations";
import AccentLink from "_features/common/components/accent-link";
import { getErrorMessage } from "_libraries/fetch/error-message";
import { isValidEmail } from "_utilities/email";

const ERROR_FIELD_MAP: Record<string, "email" | "password" | "name"> = {
  US002: "email",
  US003: "email",
  US004: "password",
  US005: "name",
};

/** 백엔드 `_check_password` 와 같은 규칙 — 8~64자 · 영문 1자 이상 · 숫자 1자 이상 */
function isValidPassword(value: string): boolean {
  return value.length >= 8 && value.length <= 64 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

/**
 * 회원가입 (plan/6.md, Figma 77:170) — 로그인과 같은 한 칼럼. URL 직접 진입만(로그인의 가입 링크는 베타 차단).
 * 비밀번호 규칙은 설명 줄에 미리 보여 주고, 제출 전에 같은 규칙으로 검사한다(서버 US004 전에).
 */
export default function RegisterSection() {
  const t = useTranslations("auth");
  const tg = useTranslations("general.common");
  const te = useTranslations("error");
  const router = useRouter();
  const params = useParams<{ locale: string }>();

  const form = useForm({
    initialValues: { email: "", password: "", confirmPassword: "", name: "" },
    validate: {
      email: (value) => (isValidEmail(value.trim()) ? null : t("email_format_message")),
      password: (value) => (isValidPassword(value) ? null : t("password_rule_message")),
      confirmPassword: (value, values) =>
        value !== values.password ? t("password_mismatch_message") : null,
      name: (value) => (value.trim() ? null : t("name_required_message")),
    },
  });

  const { registerMutation } = useAuthMutations({
    onRegisterError: (error) => {
      const field = error.errorCode ? ERROR_FIELD_MAP[error.errorCode] : undefined;
      // 문구는 에러코드 → i18n 순(getErrorMessage) — 영어 화면에 백엔드 한국어가 나오지 않게
      const message = getErrorMessage(error, te);
      if (field) {
        form.setFieldError(field, message);
        return;
      }
      notifications.show({
        title: tg("notificationstitle"),
        message: message || t("register_failed"),
        color: "danger",
      });
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    try {
      await registerMutation.mutateAsync({ ...values, email: values.email.trim(), name: values.name.trim() });
      notifications.show({
        title: tg("notificationstitle"),
        message: t("register_success"),
        color: "positive",
      });
      router.push(`/${params.locale}/login`);
    } catch {
      // onRegisterError 에서 처리됨
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <Stack gap={12} align="flex-start">
        <BrandLogo size={40} />
        <Title order={1} style={{ fontSize: 22, lineHeight: "30px", letterSpacing: "-0.03em" }}>
          {t("welcome_register_title")}
        </Title>
        <Text c="dimmed" style={{ fontSize: 13, lineHeight: "19px" }}>
          {t("welcome_register_subtitle")}
        </Text>
      </Stack>

      <Stack gap={14} mt={32}>
        <TextInput
          {...form.getInputProps("name")}
          label={t("name")}
          placeholder={t("name_placeholder")}
          autoComplete="name"
        />
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
          description={t("password_rule")}
          inputWrapperOrder={["label", "input", "description", "error"]}
          autoComplete="new-password"
        />
        <PasswordInput
          {...form.getInputProps("confirmPassword")}
          label={t("confirm_password")}
          placeholder={t("confirm_password_placeholder")}
          autoComplete="new-password"
        />
      </Stack>

      <Button type="submit" fullWidth size="lg" mt={24} loading={registerMutation.isPending}>
        {t("register_submit")}
      </Button>
      {/* 좌정렬 — 가운데 정렬 없음(DESIGN §1). AccentLink 왼쪽 히트 패딩 12 는 gap 으로 흡수 */}
      <Group gap={0} mt={16} wrap="nowrap">
        <Text c="dimmed" style={{ fontSize: 13, lineHeight: "19px" }}>
          {t("login_prompt")}
        </Text>
        <AccentLink variant="header" href={`/${params.locale}/login`}>
          {t("login_link")}
        </AccentLink>
      </Group>
    </form>
  );
}
