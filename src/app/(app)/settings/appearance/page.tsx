"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface } from "@/components/ui/surface";
import { useBank } from "@/lib/store";
import type { ThemeChoice } from "@/lib/types";
import { cn } from "@/lib/utils";

const OPTIONS: { value: ThemeChoice; label: string; detail: string; icon: LucideIcon }[] = [
  { value: "light", label: "Light", detail: "Bright, high-contrast surfaces", icon: Sun },
  { value: "dark", label: "Dark", detail: "Deep navy, easier at night", icon: Moon },
  { value: "system", label: "System", detail: "Follows your device setting", icon: Monitor },
];

/** Miniature of a light screen, drawn from the neutral scale. */
function LightPreview() {
  return (
    <div className="flex h-full flex-col gap-1.5 rounded-lg bg-ink-25 p-2.5">
      <div className="rounded-sm bg-surface p-2 shadow-e1">
        <div className="h-1.5 w-10 rounded-3xl bg-ink-300" />
        <div className="mt-1.5 h-1.5 w-6 rounded-3xl bg-ink-100" />
      </div>
      <div className="flex-1 rounded-sm bg-surface shadow-e1" />
    </div>
  );
}

/** Miniature of a dark screen — the navy field is fixed in both appearances. */
function DarkPreview() {
  return (
    <div className="surface-navy flex h-full flex-col gap-1.5 rounded-lg p-2.5">
      <div className="rounded-sm bg-white/10 p-2">
        <div className="h-1.5 w-10 rounded-3xl bg-white/45" />
        <div className="mt-1.5 h-1.5 w-6 rounded-3xl bg-white/20" />
      </div>
      <div className="flex-1 rounded-sm bg-white/8" />
    </div>
  );
}

export default function AppearancePage() {
  const theme = useBank((s) => s.preferences.theme);
  const setTheme = useBank((s) => s.setTheme);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader
        title="Appearance"
        subtitle="Choose how Auremont looks on this device"
        back="/settings"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {OPTIONS.map((o, i) => {
          const selected = theme === o.value;
          return (
            <Surface
              key={o.value}
              index={i}
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              onClick={() => setTheme(o.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setTheme(o.value);
                }
              }}
              className={cn(
                "press cursor-pointer p-3 transition-colors",
                selected ? "border-ink-900 shadow-e2" : "hover:border-line-strong"
              )}
            >
              <div className="h-24 overflow-hidden rounded-lg border border-line">
                {o.value === "light" && <LightPreview />}
                {o.value === "dark" && <DarkPreview />}
                {o.value === "system" && (
                  <div className="grid h-full grid-cols-2 gap-px bg-line">
                    <LightPreview />
                    <DarkPreview />
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-start gap-2">
                <o.icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-ink-900">{o.label}</p>
                  <p className="mt-0.5 text-sm leading-snug text-ink-400">{o.detail}</p>
                </div>
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-3xl border transition-colors",
                    selected
                      ? "border-ink-900 bg-ink-900 text-action-fg"
                      : "border-line-strong bg-surface"
                  )}
                >
                  {selected && <Check className="h-4 w-4" />}
                </span>
              </div>
            </Surface>
          );
        })}
      </div>

      <p className="mt-4 px-1 text-sm leading-relaxed text-ink-400">
        Your choice applies straight away and is remembered on this device only. System follows
        your phone or computer, switching automatically at sunset if you have scheduled it there.
      </p>
    </div>
  );
}
