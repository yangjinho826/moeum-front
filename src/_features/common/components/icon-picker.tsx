"use client";

import { Input, SimpleGrid, UnstyledButton } from "@mantine/core";

import DynamicIcon, {
  ICON_KEYS,
  type IconKey,
} from "./dynamic-icon";

interface IconPickerProps {
  value?: string | null;
  onChange?: (icon: IconKey) => void;
  label?: string;
}

/**
 * 아이콘 선택 — 8열 · 36 박스(Figma 60:77 Field/아이콘).
 * 기본 surface-2 + dim 아이콘, 선택 accent-soft + accent 2px 안쪽 테두리 + accent 아이콘 (DESIGN §2-3 행동·활성 = accent).
 */
export default function IconPicker({
  value,
  onChange,
  label,
}: IconPickerProps) {
  return (
    <Input.Wrapper label={label}>
      <SimpleGrid cols={8} spacing={6} verticalSpacing={6}>
        {ICON_KEYS.map((key) => {
          const selected = value === key;
          return (
            <UnstyledButton
              key={key}
              onClick={() => onChange?.(key)}
              aria-label={key}
              aria-pressed={selected}
              h={36}
              style={{
                borderRadius: "var(--mantine-radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: selected
                  ? "var(--moeum-accent-soft)"
                  : "var(--moeum-surface-2)",
                // accent-soft 는 surface-2 위에서 구분이 약해 테두리로 한 번 더 (색 선택 링과 같은 역할)
                boxShadow: selected ? "inset 0 0 0 2px var(--moeum-accent)" : "none",
              }}
            >
              <DynamicIcon
                name={key}
                size={18}
                stroke={2}
                color={
                  selected
                    ? "var(--moeum-accent)"
                    : "var(--mantine-color-dimmed)"
                }
              />
            </UnstyledButton>
          );
        })}
      </SimpleGrid>
    </Input.Wrapper>
  );
}
