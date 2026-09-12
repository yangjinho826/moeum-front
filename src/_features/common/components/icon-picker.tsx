"use client";

import { Input, SimpleGrid, UnstyledButton } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useId } from "react";

import DynamicIcon, {
  ICON_KEYS,
  type IconKey,
} from "./dynamic-icon";

interface IconPickerProps {
  value?: string | null;
  onChange?: (icon: IconKey) => void;
  /** 있으면 고른 아이콘을 다시 눌러 비운다 */
  onClear?: () => void;
  label?: string;
  description?: string;
}

/**
 * 아이콘 선택 — 8열 · 44 박스(히트 44, 배치3 S6 F-302 — Figma 60:77 는 36 에서 갱신).
 * 기본 surface-2 + dim 아이콘, 선택 accent-soft + accent 2px 안쪽 테두리 + accent 아이콘 (DESIGN §2-3 행동·활성 = accent).
 */
export default function IconPicker({
  value,
  onChange,
  onClear,
  label,
  description,
}: IconPickerProps) {
  const t = useTranslations("general.picker");
  const labelId = useId();
  const descId = useId();

  return (
    <Input.Wrapper
      label={label}
      labelElement="div"
      labelProps={{ id: labelId }}
      description={description}
      // 설명이 타일에 붙지 않게 6 — 색 선택과 같은 간격
      descriptionProps={{ id: descId, mt: 6 }}
      inputWrapperOrder={["label", "input", "description"]}
    >
      <SimpleGrid
        cols={8}
        spacing={6}
        verticalSpacing={6}
        role="group"
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={description ? descId : undefined}
      >
        {ICON_KEYS.map((key) => {
          const selected = value === key;
          return (
            <UnstyledButton
              key={key}
              onClick={() => (selected && onClear ? onClear() : onChange?.(key))}
              aria-label={t(`icons.${key}`)}
              aria-pressed={selected}
              h={44}
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
