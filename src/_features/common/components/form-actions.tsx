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
 * 폼 하단 액션 공통 블록 — 취소(outline = hair 테두리)/저장(filled accent) + 선택적 삭제 (DESIGN.md §5 버튼).
 *
 * sticky 모드는 시트 스크롤 컨테이너 하단에 붙는다. FormSheet body 의
 * paddingBottom(--bottom-tab-h + --safe-bottom + 16px)을 음수 마진으로 파고들고,
 * sticky bottom 오프셋을 같은 변수로 잡아 BottomTab(z 500) 바로 위에 정확히 얹힌다 —
 * 데스크탑(--bottom-tab-h: 0)에서도 같은 식이 그대로 성립한다.
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
  const buttons = (
    <Stack gap="sm">
      <Group grow>
        {onCancel && (
          <Button
            type="button"
            variant="default"
            onClick={onCancel}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          type="submit"
          loading={isPending}
          disabled={submitDisabled}
          color={submitColor}
        >
          {submitLabel}
        </Button>
      </Group>
      {onRemove && (
        <Stack gap={4}>
          <Button
            type="button"
            variant="light"
            color="red"
            onClick={onRemove}
            disabled={isPending || removeDisabled}
            fullWidth
          >
            {removeLabel}
          </Button>
          {removeHint && (
            <Text size="xs" c="dimmed" ta="center">
              {removeHint}
            </Text>
          )}
        </Stack>
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
        bottom: "calc(var(--bottom-tab-h) + var(--safe-bottom))",
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
