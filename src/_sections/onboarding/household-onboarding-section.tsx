"use client";

import { Button, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { useHouseholdMutations } from "_features/household/queries/use-mutations";
import { getErrorMessage } from "_libraries/fetch/error-message";
import { todayIsoKst } from "_utilities/datetime";

interface FormValues {
  name: string;
}

/**
 * 첫 가계부 만들기 (plan/7.md, Figma 78:79) — 가계부 0개인 계정만 OnboardingGuard 가 보낸다.
 * 로그인과 같은 한 칼럼: 제목 → 설명 → 이름(+ 통화·시작일 안내) → 버튼. 카드·가운데 정렬 없음(DESIGN §1).
 */
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
        name: z.string().trim().min(1, t("name_required_message")),
      }),
    ),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync({
        name: values.name.trim(),
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
    <form onSubmit={form.onSubmit(onSubmit)} noValidate>
      <Stack gap={12} pt={{ base: 44, lg: 72 }} maw={448}>
        <Title order={1} style={{ fontSize: 22, lineHeight: "30px", letterSpacing: "-0.03em" }}>
          {t("welcome_title")}
        </Title>
        <Text c="dimmed" style={{ fontSize: 13, lineHeight: "19px" }}>
          {t("welcome_desc")}
        </Text>
      </Stack>
      <Stack gap={0} mt={32} maw={448}>
        <TextInput
          {...form.getInputProps("name")}
          label={t("household_name")}
          placeholder={t("household_name_placeholder")}
          // 통화·시작일 안내는 누르기 전에 읽히게 설명 줄로(가입 비밀번호 규칙과 같은 자리)
          description={t("hint")}
          inputWrapperOrder={["label", "input", "description", "error"]}
          maxLength={100}
          autoComplete="off"
        />
        <Button type="submit" size="lg" fullWidth mt={24} loading={createMutation.isPending}>
          {t("submit")}
        </Button>
      </Stack>
    </form>
  );
}
