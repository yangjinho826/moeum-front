"use client";

import { Box, Input, SimpleGrid, UnstyledButton } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useId } from "react";

import { USER_COLOR_PALETTE } from "_styles/palette";

interface ColorPickerProps {
  value?: string | null;
  onChange?: (color: string) => void;
  /** 있으면 고른 색을 다시 눌러 비운다(비움 = 다른 값을 따른다 — 고정지출은 카테고리 색) */
  onClear?: () => void;
  label?: string;
  description?: string;
}

/**
 * 색 선택 — 12색 원 28 · 6열 2줄 (Figma 60:77 Field/색).
 * 팔레트는 저장되는 사용자 데이터라 hex 그대로. 히트는 44(원은 가운데 28), 선택은 box-shadow 링 —
 * outline 은 키보드 focus-visible 링 몫으로 남긴다 (배치3 S6 F-301·302).
 */
export default function ColorPicker({
  value,
  onChange,
  onClear,
  label,
  description,
}: ColorPickerProps) {
  const t = useTranslations("general.picker");
  const labelId = useId();

  return (
    <Input.Wrapper
      label={label}
      labelElement="div"
      labelProps={{ id: labelId }}
      description={description}
      inputWrapperOrder={["label", "input", "description"]}
    >
      {/* 44 히트 안의 28 원 — 음수 마진으로 첫 원을 라벨 선에 맞춘다 */}
      <SimpleGrid
        cols={6}
        spacing={0}
        verticalSpacing={0}
        w="fit-content"
        mx={-8}
        my={-6}
        role="group"
        aria-labelledby={label ? labelId : undefined}
      >
        {USER_COLOR_PALETTE.map((c, i) => {
          const selected = value === c;
          return (
            <UnstyledButton
              key={c}
              onClick={() => (selected && onClear ? onClear() : onChange?.(c))}
              aria-label={t("color_option", { n: i + 1 })}
              aria-pressed={selected}
              w={44}
              h={44}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}
            >
              <Box
                w={28}
                h={28}
                style={{
                  borderRadius: "50%",
                  background: c,
                  boxShadow: selected
                    ? "0 0 0 2px var(--moeum-surface), 0 0 0 4px var(--moeum-text)"
                    : "none",
                }}
              />
            </UnstyledButton>
          );
        })}
      </SimpleGrid>
    </Input.Wrapper>
  );
}
