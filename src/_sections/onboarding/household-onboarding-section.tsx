"use client";

import {
  Button,
  Card,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { useHouseholdMutations } from "_features/household/queries/use-mutations";
import { getErrorMessage } from "_libraries/fetch/error-message";
import { todayIsoKst } from "_utilities/datetime";

interface FormValues {
  name: string;
}

export default function HouseholdOnboardingSection() {
  const t = useTranslations("onboarding");
  const tg = useTranslations("general.common");
  const te = useTranslations("error");
  const router = useRouter();
  const params = useParams<{ locale: string }>();

  const { createMutation } = useHouseholdMutations();

  const form = useForm<FormValues>({
    initialValues: { name: "" },
    validate: zodResolver(
      z.object({
        name: z.string().min(1, t("name_required_message")),
      }),
    ),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync({
        name: values.name,
        description: null,
        currency: "KRW",
        startedAt: todayIsoKst(),
      });
      notifications.show({
        title: tg("notificationstitle"),
        message: t("created_message"),
        color: "positive",
      });
      router.replace(`/${params.locale}`);
    } catch (error) {
      notifications.show({
        title: tg("notificationstitle"),
        message: getErrorMessage(error, te),
        color: "danger",
      });
    }
  };

  return (
    <Stack gap="lg" mt="xl">
      <Stack gap={4}>
        <Title order={2}>{t("welcome_title")}</Title>
        <Text c="dimmed" size="sm">
          {t("welcome_desc")}
        </Text>
      </Stack>

      <Card>
        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack gap="md">
            <TextInput
              {...form.getInputProps("name")}
              label={t("household_name")}
              placeholder={t("household_name_placeholder")}
              size="md"
              autoFocus
            />
            <Button
              type="submit"
              size="md"
              loading={createMutation.isPending}
              fullWidth
            >
              {t("submit")}
            </Button>
          </Stack>
        </form>
      </Card>

      <Text size="xs" c="dimmed" ta="center">
        {t("hint")}
      </Text>
    </Stack>
  );
}
