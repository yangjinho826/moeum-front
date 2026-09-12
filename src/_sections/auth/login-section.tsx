"use client";

import {
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { isEmail, isNotEmpty, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import BrandLogo from "_features/auth/components/brand-logo";
import { useAuthMutations } from "_features/auth/queries/use-mutations";
import { TOKEN } from "_styles/design-tokens";

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
    <form
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", flex: 1 }}
    >
      {/* hero — 상단 그라데이션 위 브랜드 블록(좌정렬). 세리프 워드마크 1회만(DESIGN.md). */}
      <Stack gap={18} align="flex-start" style={{ padding: "64px 28px 32px" }}>
        <BrandLogo size={64} />
        <Stack gap={10}>
          <Text
            component="h1"
            className="brand-wordmark"
            style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.1 }}
          >
            {t("brand_name")}
          </Text>
          <Text size="md" c="dimmed" style={{ lineHeight: 1.5, wordBreak: "keep-all" }}>
            {t("brand_tagline")}
          </Text>
        </Stack>
      </Stack>

      {/* 카드 시트 — 하단에 붙는 폼 카드(상단 라운드 + 위로 떨어지는 그림자). */}
      <div
        style={{
          marginTop: "auto",
          background: TOKEN.card,
          borderRadius: "28px 28px 0 0",
          boxShadow: "0 -8px 30px rgba(120, 100, 70, 0.1)",
          padding: "30px 26px 40px",
        }}
      >
        <Stack gap="sm">
          <TextInput
            {...form.getInputProps("email")}
            label={t("email")}
            placeholder={t("email_placeholder")}
            size="md"
          />
          <PasswordInput
            {...form.getInputProps("password")}
            label={t("password")}
            placeholder={t("password_placeholder")}
            size="md"
          />
        </Stack>
        <Button
          type="submit"
          fullWidth
          size="lg"
          radius="xl"
          fw={700}
          mt="lg"
          loading={loginMutation.isPending}
        >
          {t("login_submit")}
        </Button>
      </div>
    </form>
  );
}
