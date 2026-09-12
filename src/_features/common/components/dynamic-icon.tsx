"use client";

import {
  IconBriefcase,
  IconBuilding,
  IconBus,
  IconCar,
  IconCoffee,
  IconCreditCard,
  IconDeviceTv,
  IconDumbbell,
  IconGift,
  IconHeart,
  IconHome,
  IconPhone,
  IconPigMoney,
  IconShoppingBag,
  IconTrendingUp,
  IconWallet,
  IconWand,
  type IconProps,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

export const ICON_KEYS = [
  "wallet",
  "home",
  "building",
  "briefcase",
  "coffee",
  "car",
  "bus",
  "shopping-bag",
  "heart",
  "gift",
  "trending-up",
  "piggy-bank",
  "credit-card",
  "phone",
  "tv",
  "dumbbell",
] as const;

export type IconKey = (typeof ICON_KEYS)[number];

const MAP: Record<string, ComponentType<IconProps>> = {
  wallet: IconWallet,
  home: IconHome,
  building: IconBuilding,
  briefcase: IconBriefcase,
  coffee: IconCoffee,
  car: IconCar,
  bus: IconBus,
  "shopping-bag": IconShoppingBag,
  heart: IconHeart,
  gift: IconGift,
  "trending-up": IconTrendingUp,
  "piggy-bank": IconPigMoney,
  "credit-card": IconCreditCard,
  phone: IconPhone,
  tv: IconDeviceTv,
  dumbbell: IconDumbbell,
};

/** 선택기 16개 안의 이름인지 — 시드·옛 데이터엔 목록 밖 이름(tools-kitchen-2 · dots …)이 있어 요술봉 대체가 뜬다 */
export const isKnownIcon = (name?: string | null): name is IconKey =>
  Boolean(name && MAP[name]);

type DynamicIconProps = IconProps & {
  name?: string | null;
};

export default function DynamicIcon({ name, ...rest }: DynamicIconProps) {
  const Icon = (name && MAP[name]) || IconWand;
  return <Icon {...rest} />;
}
