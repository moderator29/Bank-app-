"use client";

import {
  ArrowLeftRight,
  ArrowDownToLine,
  Banknote,
  Car,
  HeartPulse,
  House,
  Landmark,
  Plane,
  Receipt,
  Repeat,
  ShoppingBag,
  ShoppingBasket,
  Ticket,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/lib/types";
import { IconTile } from "@/components/ui/surface";

/** One icon per category — the whole app draws transaction icons from here. */
export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  income: Banknote,
  transfer: ArrowLeftRight,
  deposit: ArrowDownToLine,
  food: UtensilsCrossed,
  groceries: ShoppingBasket,
  transport: Car,
  shopping: ShoppingBag,
  entertainment: Ticket,
  subscriptions: Repeat,
  bills: Receipt,
  housing: House,
  health: HeartPulse,
  travel: Plane,
  atm: Landmark,
};

export const CATEGORY_LABEL: Record<Category, string> = {
  income: "Income",
  transfer: "Transfer",
  deposit: "Deposit",
  food: "Food & dining",
  groceries: "Groceries",
  transport: "Transportation",
  shopping: "Shopping",
  entertainment: "Entertainment",
  subscriptions: "Subscriptions",
  bills: "Bills & utilities",
  housing: "Housing",
  health: "Health",
  travel: "Travel",
  atm: "Cash & ATM",
};

/**
 * Money in reads green, internal movement reads blue, everything else stays
 * neutral — colour carries meaning rather than decoration.
 */
export function CategoryIcon({
  category,
  incoming,
  size = "md",
}: {
  category: Category;
  incoming?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = CATEGORY_ICON[category];
  const tone = incoming
    ? "pos"
    : category === "transfer"
      ? "info"
      : category === "deposit"
        ? "pos"
        : "neutral";
  return (
    <IconTile tone={tone} size={size}>
      <Icon />
    </IconTile>
  );
}
