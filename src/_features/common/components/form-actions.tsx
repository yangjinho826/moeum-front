"use client";

import { Box, Button, Group, Stack, Text } from "@mantine/core";

interface FormActionsProps {
  submitLabel: string;
  isPending: boolean;
  submitDisabled?: boolean;
  submitColor?: string;
  onCancel?: (() => void) | undefined;
  cancelLabel?: string;
  onRemove?: (() => void) | undefined;
  removeLabel?: string;
  removeDisabled?: boolean;
  removeHint?: string | undefined;
  /** 바텀시트(FormSheet) 안에서는 true — 폼이 스크롤돼도 버튼이 항상 보이게 고정. 페이지(카드) 모드는 false. */
  sticky?: boolean;
}

/**
 * 폼 하단 액션 공통 블록 — 삭제(subtle danger, 좌측) · 취소(outline = hair 테두리) · 저장(filled accent) 한 줄 (DESIGN.md §5 버튼, 배치3).
 *
 * sticky 모드는 시트 스크롤 컨테이너 하단에 붙는다. FormSheet body 의
 * paddingBottom(--safe-bottom + 16px)을 음수 마진으로 파고들고, sticky bottom 을
 * --safe-bottom 으로 잡아 홈 인디케이터 바로 위에 얹힌다(시트가 탭바를 덮으므로 탭바 보정 없음).
 */
export default function FormActions({
  submitLabel,
  isPending,
  submitDisabled,
  submitColor,
  onCancel,
  cancelLabel,
  onRemove,
  removeLabel,
  removeDisabled,
  removeHint,
  sticky = false,
}: FormActionsProps) {
  // 한 줄: [삭제 subtle danger · 좌측 auto 폭] [취소 outline] [저장 filled] (Figma 60:249 FormActions)
  // 삭제는 글자 왼쪽 끝이 필드 왼쪽 선에 맞게 음수 마진으로 패딩을 먹는다
  const buttons = (
    <Stack gap={4}>
      <Group gap="sm" wrap="nowrap">
        {onRemove && (
          <Button
            type="button"
            variant="subtle"
            color="danger"
            onClick={onRemove}
            disabled={isPending || removeDisabled}
            px={12}
            ml={-12}
            style={{ flexShrink: 0 }}
          >
            {removeLabel}
          </Button>
        )}
        {onCancel && (
          <Button
            type="button"
            variant="default"
            onClick={onCancel}
            disabled={isPending}
            flex={1}
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          type="submit"
          loading={isPending}
          disabled={submitDisabled}
          color={submitColor}
          flex={1}
        >
          {submitLabel}
        </Button>
      </Group>
      {onRemove && removeHint && (
        <Text size="xs" c="dimmed">
          {removeHint}
        </Text>
      )}
    </Stack>
  );

  if (!sticky) {
    return <Box mt="md">{buttons}</Box>;
  }

  return (
    <Box
      mt="md"
      style={{
        position: "sticky",
        bottom: "var(--safe-bottom)",
        zIndex: 1,
        // 시트·모달 표면(surface)과 같은 색 — 스크롤되는 필드가 버튼 뒤로 비치지 않게
        background: "var(--moeum-surface)",
        marginInline: "calc(var(--mantine-spacing-md) * -1)",
        marginBottom: "calc(var(--mantine-spacing-md) * -1)",
        padding:
          "var(--mantine-spacing-sm) var(--mantine-spacing-md) var(--mantine-spacing-md)",
      }}
    >
      {buttons}
    </Box>
  );
}
