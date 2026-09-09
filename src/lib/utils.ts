import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

/** $1,234.56 — the app's single money formatter. */
export function money(value: number, opts?: { compact?: boolean; signed?: boolean }) {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: opts?.compact && abs >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: opts?.compact && abs >= 10_000 ? 1 : 2,
    minimumFractionDigits: opts?.compact && abs >= 10_000 ? 0 : 2,
  }).format(abs);
  if (!opts?.signed) return value < 0 ? `-${formatted}` : formatted;
  return `${value < 0 ? "−" : "+"}${formatted}`;
}

export function formatDate(iso: string, style: "short" | "medium" | "long" = "medium") {
  const d = new Date(iso);
  if (style === "short") return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (style === "long")
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** "Today" / "Yesterday" / "Mon, Sep 1" — group headers in activity lists. */
export function relativeDay(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(today) - startOf(d)) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return d.toLocaleDateString("en-US", { weekday: "long" });
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(d.getFullYear() !== today.getFullYear() ? { year: "numeric" } : {}),
  });
}

export function dueLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(d) - startOf(today)) / 86_400_000);
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function firstName(full: string) {
  return full.trim().split(/\s+/)[0] ?? "";
}

export function initials(full: string) {
  return full
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function maskDots(mask: string) {
  return `•••• ${mask}`;
}
