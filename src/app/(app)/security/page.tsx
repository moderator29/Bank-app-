"use client";

import * as React from "react";
import {
  AlertTriangle,
  Check,
  History,
  KeyRound,
  Laptop,
  ScanFace,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, IconTile } from "@/components/ui/surface";
import { ListGroup, ListRow, Toggle } from "@/components/ui/list";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { PasscodeGate } from "@/components/ui/passcode-gate";
import { useBank } from "@/lib/store";
import { cn, relativeDay } from "@/lib/utils";

interface Gate {
  reason: string;
  run: () => void;
}

export default function SecurityPage() {
  const preferences = useBank((s) => s.preferences);
  const setPreference = useBank((s) => s.setPreference);
  const devices = useBank((s) => s.devices);
  const loginEvents = useBank((s) => s.loginEvents);

  const [gate, setGate] = React.useState<Gate | null>(null);
  const [passwordOpen, setPasswordOpen] = React.useState(false);

  const active =
    1 + (preferences.biometric ? 1 : 0) + (preferences.twoFactor ? 1 : 0) + 1;
  const allGood = preferences.biometric && preferences.twoFactor;
  const lastSignIn = loginEvents.find((e) => e.status === "success");

  const items = [
    { label: "Passcode", state: "6-digit passcode set", ok: true },
    {
      label: "Face ID",
      state: preferences.biometric ? "On for this device" : "Off",
      ok: preferences.biometric,
    },
    {
      label: "Two-step verification",
      state: preferences.twoFactor ? "On for new devices" : "Off",
      ok: preferences.twoFactor,
    },
    {
      label: "Trusted devices",
      state: `${devices.length} device${devices.length === 1 ? "" : "s"}`,
      ok: true,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader
        title="Security centre"
        subtitle="Everything protecting your account, in one place"
        back="/profile"
      />

      <Surface index={0} className="p-5">
        <div className="flex items-start gap-3.5">
          <IconTile tone={allGood ? "pos" : "brass"} size="lg">
            <ShieldCheck />
          </IconTile>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-ink-900">
              {allGood
                ? "Your account is well protected"
                : `${4 - active} safeguard${4 - active === 1 ? " is" : "s are"} switched off`}
            </h2>
            <p className="mt-0.5 text-sm text-ink-400">
              {active} of 4 safeguards active
              {lastSignIn ? ` · Last sign-in ${relativeDay(lastSignIn.date).toLowerCase()}` : ""}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 border-t border-line pt-4 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2.5 rounded-lg bg-surface-sunken px-3 py-2.5"
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-3xl",
                  item.ok ? "bg-pos-50 text-pos-500" : "bg-warn-50 text-warn-500"
                )}
              >
                {item.ok ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ink-800">
                  {item.label}
                </span>
                <span className="block truncate text-2xs text-ink-400">{item.state}</span>
              </span>
            </div>
          ))}
        </div>
      </Surface>

      <div className="mt-6 space-y-6">
        <ListGroup label="Sign in">
          <ListRow
            icon={
              <IconTile tone="neutral">
                <KeyRound />
              </IconTile>
            }
            title="Change passcode"
            detail="Your 6-digit code for opening the app"
            href="/security/passcode"
          />
          <ListRow
            icon={
              <IconTile tone="neutral">
                <ShieldCheck />
              </IconTile>
            }
            title="Change password"
            detail="Used when you sign in on a new device"
            onClick={() => setPasswordOpen(true)}
          />
          <ListRow
            icon={
              <IconTile tone="neutral">
                <ScanFace />
              </IconTile>
            }
            title="Face ID"
            detail="Unlock the app and approve payments with biometrics."
            value={
              <Toggle
                checked={preferences.biometric}
                onChange={(v) =>
                  setGate({
                    reason: v
                      ? "Confirm your passcode to turn on Face ID."
                      : "Confirm your passcode to turn off Face ID.",
                    run: () => setPreference("biometric", v),
                  })
                }
                label="Face ID"
              />
            }
          />
          <ListRow
            icon={
              <IconTile tone="neutral">
                <Smartphone />
              </IconTile>
            }
            title="Two-step verification"
            detail="Send a one-time code when signing in from an unrecognised device."
            value={
              <Toggle
                checked={preferences.twoFactor}
                onChange={(v) =>
                  setGate({
                    reason: v
                      ? "Confirm your passcode to turn on two-step verification."
                      : "Confirm your passcode to turn off two-step verification.",
                    run: () => setPreference("twoFactor", v),
                  })
                }
                label="Two-step verification"
              />
            }
          />
        </ListGroup>

        <ListGroup label="Access">
          <ListRow
            icon={
              <IconTile tone="neutral">
                <Laptop />
              </IconTile>
            }
            title="Trusted devices"
            detail={`${devices.length} device${devices.length === 1 ? "" : "s"} signed in`}
            href="/security/devices"
          />
          <ListRow
            icon={
              <IconTile tone="neutral">
                <History />
              </IconTile>
            }
            title="Sign-in activity"
            detail="Where and when your account has been opened"
            href="/security/activity"
          />
        </ListGroup>
      </div>

      <p className="mt-5 px-1 text-sm leading-relaxed text-ink-400">
        Auremont will never ask for your passcode, password or a one-time code by phone, text
        or email. If someone does, end the conversation and contact us from the app.
      </p>

      <PasscodeGate
        open={gate !== null}
        onClose={() => setGate(null)}
        onVerified={() => gate?.run()}
        reason={gate?.reason ?? ""}
      />

      <ChangePasswordSheet open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </div>
  );
}

function ChangePasswordSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setCurrent("");
    setNext("");
    setConfirm("");
    setError(null);
    setDone(false);
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (current.length < 8) return setError("Enter your current password.");
    if (next.length < 8) return setError("Your new password needs at least 8 characters.");
    if (next === current) return setError("Choose a password you haven't used before.");
    if (next !== confirm) return setError("The two new passwords don't match.");
    setError(null);
    setDone(true);
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={done ? "Password changed" : "Change password"}
      description={
        done
          ? undefined
          : "Use at least 8 characters, with a mix you don't use anywhere else."
      }
    >
      {done ? (
        <div className="pt-1">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pos-50 text-pos-500">
              <Check className="h-[18px] w-[18px]" />
            </span>
            <p className="text-sm leading-relaxed text-ink-500">
              Your password has been updated. Other devices stay signed in — remove any you
              don&apos;t recognise under Trusted devices.
            </p>
          </div>
          <Button block className="mt-4" onClick={onClose}>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3 pt-1" noValidate>
          <Field label="Current password">
            <Input
              type="password"
              value={current}
              autoComplete="current-password"
              onChange={(e) => {
                setCurrent(e.target.value);
                setError(null);
              }}
            />
          </Field>
          <Field label="New password">
            <Input
              type="password"
              value={next}
              autoComplete="new-password"
              onChange={(e) => {
                setNext(e.target.value);
                setError(null);
              }}
            />
          </Field>
          <Field label="Confirm new password" error={error}>
            <Input
              type="password"
              value={confirm}
              autoComplete="new-password"
              onChange={(e) => {
                setConfirm(e.target.value);
                setError(null);
              }}
            />
          </Field>
          <Button type="submit" block className="mt-1">
            Update password
          </Button>
        </form>
      )}
    </Sheet>
  );
}
