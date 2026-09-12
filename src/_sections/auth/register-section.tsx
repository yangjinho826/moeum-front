"use client";

import {
  Anchor,
  Button,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { isEmail, isNotEmpty, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import BrandLogo from "_features/auth/components/brand-logo";
import { useAuthMutations } from "_features/auth/queries/use-mutations";

const ERROR_FIELD_MAP: Record<string, "email" | "password" | "name"> = {
  US002: "email",
  US003: "email",
  US004: "password",
  US005: "name",
};

export default function RegisterSection() {
  const t = useTranslations("auth");
  const tg = useTranslations("general.common");
  const router = useRouter();
  const params = useParams<{ locale: string }>();

  const form = useForm({
    initialValues: { email: "", password: "", confirmPassword: "", name: "" },
    validate: {
      email: isEmail(t("email_format_message")),
      password: isNotEmpty(t("password_required_message")),
      confirmPassword: (value, values) =>
        value !== values.password ? t("password_mismatch_message") : null,
      name: isNotEmpty(t("name_required_message")),
    },
  });

  const { registerMutation } = useAuthMutations({
    onRegisterError: (error) => {
      const field = error.errorCode
        ? ERROR_FIELD_MAP[error.errorCode]
        : undefined;
      if (field) {
        form.setFieldError(field, error.errorMessage ?? "");
        return;
      }
      notifications.show({
        title: tg("notificationstitle"),
        message: error.errorMessage ?? t("register_failed"),
        color: "danger",
      });
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    try {
      await registerMutation.mutateAsync(values);
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
    <form onSubmit={onSubmit}>
      <Stack gap="xl">
        <Stack gap="md">
          <BrandLogo />
          <Stack gap={4}>
            <Title
              order={1}
              fw={800}
              style={{ whiteSpace: "pre-line", lineHeight: 1.3 }}
            >
              {t("welcome_register_title")}
            </Title>
            <Text size="sm" c="dimmed">
              {t("welcome_register_subtitle")}
            </Text>
          </Stack>
        </Stack>

        <Stack gap="sm">
          <TextInput
            {...form.getInputProps("name")}
            label={t("name")}
            placeholder={t("name_placeholder")}
          />
          <TextInput
            {...form.getInputProps("email")}
            label={t("email")}
            placeholder={t("email_placeholder")}
          />
          <PasswordInput
            {...form.getInputProps("password")}
            label={t("password")}
            placeholder={t("password_placeholder")}
          />
          <PasswordInput
            {...form.getInputProps("confirmPassword")}
            label={t("confirm_password")}
            placeholder={t("confirm_password_placeholder")}
          />
        </Stack>

        <Stack gap="sm">
          <Button
            type="submit"
            fullWidth
            size="lg"
            radius="md"
            fw={700}
            loading={registerMutation.isPending}
          >
            {t("register_submit")}
          </Button>
          <Group justify="center" gap={6}>
            <Text size="xs" c="dimmed">
              {t("login_prompt")}
            </Text>
            <Anchor
              component={Link}
              href={`/${params.locale}/login`}
              size="xs"
              fw={700}
            >
              {t("login_link")}
            </Anchor>
          </Group>
        </Stack>
      </Stack>
    </form>
  );
}
