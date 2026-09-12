"use client";

import { Input, SimpleGrid, UnstyledButton } from "@mantine/core";

import { USER_COLOR_PALETTE } from "_styles/palette";

interface ColorPickerProps {
  value?: string | null;
  onChange?: (color: string) => void;
  label?: string;
}

/**
 * 색 선택 — 12색 원 28 · 6열 2줄 (Figma 60:77 Field/색).
 * 팔레트는 저장되는 사용자 데이터라 hex 그대로, 선택 표시만 토큰(본문색 2px 링 · 간격 2).
 */
export default function ColorPicker({
  value,
  onChange,
  label,
}: ColorPickerProps) {
  return (
    <Input.Wrapper label={label}>
      <SimpleGrid
        cols={6}
        spacing={16}
        verticalSpacing={12}
        w="fit-content"
        p={2}
      >
        {USER_COLOR_PALETTE.map((c) => {
          const selected = value === c;
          return (
            <UnstyledButton
              key={c}
              onClick={() => onChange?.(c)}
              aria-label={c}
              aria-pressed={selected}
              w={28}
              h={28}
              style={{
                borderRadius: "50%",
                background: c,
                outline: selected ? "2px solid var(--moeum-text)" : "none",
                outlineOffset: 2,
              }}
            />
          );
        })}
      </SimpleGrid>
    </Input.Wrapper>
  );
}
