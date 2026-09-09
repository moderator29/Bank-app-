"use client";

import * as React from "react";
import { Bell, Fingerprint, EyeOff } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/list";
import { LogoMark } from "@/components/brand/logo";
import { useBank } from "@/lib/store";
import { firstName } from "@/lib/utils";

/**
 * Shown once, on first entry: three choices that genuinely change how the
 * app behaves, then never again.
 */
export function WelcomeSheet() {
  const onboarded = useBank((s) => s.onboarded);
  const complete = useBank((s) => s.completeOnboarding);
  const user = useBank((s) => s.user);
  const prefs = useBank((s) => s.preferences);
  const setPreference = useBank((s) => s.setPreference);
  const [open, setOpen] = React.useState(false);

  // Delay a beat so Home paints first — the sheet should feel like a greeting.
  React.useEffect(() => {
    if (onboarded) return;
    const t = window.setTimeout(() => setOpen(true), 620);
    return () => window.clearTimeout(t);
  }, [onboarded]);

  const finish = () => {
    complete();
    setOpen(false);
  };

  return (
    <Sheet
      open={open}
      onClose={finish}
      title={`Welcome, ${firstName(user.name)}`}
      description="Three quick preferences before you start. You can change these any time in Settings."
    >
      <div className="space-y-3">
        <div className="mb-1 flex justify-center pb-1">
          <LogoMark className="h-12 w-12" />
        </div>

        <Choice
          icon={<Fingerprint className="h-[18px] w-[18px]" />}
          title="Face ID sign-in"
          detail="Unlock Auremont without typing your passcode."
          checked={prefs.biometric}
          onChange={(v) => setPreference("biometric", v)}
        />
        <Choice
          icon={<Bell className="h-[18px] w-[18px]" />}
          title="Transaction alerts"
          detail="Get notified the moment money moves."
          checked={prefs.pushTransactions}
          onChange={(v) => setPreference("pushTransactions", v)}
        />
        <Choice
          icon={<EyeOff className="h-[18px] w-[18px]" />}
          title="Hide balances on open"
          detail="Keep figures covered until you reveal them."
          checked={prefs.hideBalancesOnOpen}
          onChange={(v) => setPreference("hideBalancesOnOpen", v)}
        />

        <Button block size="lg" onClick={finish} className="mt-2">
          Continue to your account
        </Button>
      </div>
    </Sheet>
  );
}

function Choice({
  icon,
  title,
  detail,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-600">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink-900">{title}</p>
        <p className="mt-0.5 text-xs leading-snug text-ink-400">{detail}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}
