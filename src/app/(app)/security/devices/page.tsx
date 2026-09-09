"use client";

import * as React from "react";
import { Laptop, LogOut, Smartphone, Tablet, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, IconTile, Chip } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { PasscodeGate } from "@/components/ui/passcode-gate";
import { useBank } from "@/lib/store";
import type { Device } from "@/lib/types";
import { relativeDay } from "@/lib/utils";

const iconFor = (d: Device): LucideIcon => {
  const t = `${d.name} ${d.platform}`.toLowerCase();
  if (t.includes("ipad") || t.includes("tablet")) return Tablet;
  if (t.includes("iphone") || t.includes("android") || t.includes("pixel")) return Smartphone;
  return Laptop;
};

type Pending = { kind: "one"; device: Device } | { kind: "all" };

export default function DevicesPage() {
  const devices = useBank((s) => s.devices);
  const revokeDevice = useBank((s) => s.revokeDevice);
  const revokeOtherDevices = useBank((s) => s.revokeOtherDevices);

  const [pending, setPending] = React.useState<Pending | null>(null);
  const [stage, setStage] = React.useState<"confirm" | "verify">("confirm");

  const others = devices.filter((d) => !d.current);

  const ask = (next: Pending) => {
    setPending(next);
    setStage("confirm");
  };

  const run = () => {
    if (!pending) return;
    if (pending.kind === "all") revokeOtherDevices();
    else revokeDevice(pending.device.id);
    setPending(null);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader
        title="Trusted devices"
        subtitle="Everywhere your account is currently signed in"
        back="/security"
        action={
          others.length > 0 ? (
            <Button variant="secondary" size="sm" onClick={() => ask({ kind: "all" })}>
              <LogOut className="h-4 w-4" />
              Sign out all others
            </Button>
          ) : undefined
        }
      />

      <div className="space-y-3">
        {devices.map((device, i) => {
          const Icon = iconFor(device);
          return (
            <Surface key={device.id} index={i} className="p-4">
              <div className="flex items-start gap-3.5">
                <IconTile tone={device.current ? "navy" : "neutral"} size="lg">
                  <Icon />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-semibold text-ink-900">
                      {device.name}
                    </h3>
                    {device.current && <Chip tone="pos">This device</Chip>}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-ink-400">{device.platform}</p>
                  <p className="mt-1.5 text-sm text-ink-400">
                    {device.location} ·{" "}
                    <span className="text-ink-500">
                      {device.current ? "Active now" : relativeDay(device.lastActive)}
                    </span>
                  </p>
                </div>
                {!device.current && (
                  <Button
                    variant="ghost"
                    size="iconSm"
                    aria-label={`Remove ${device.name}`}
                    onClick={() => ask({ kind: "one", device })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Surface>
          );
        })}
      </div>

      {others.length === 0 && (
        <div className="mt-3">
          <EmptyState
            icon={Smartphone}
            title="No other devices"
            body="Only the device you're using now is signed in to your account. We'll list anything new here the first time it's used."
            compact
          />
        </div>
      )}

      <p className="mt-5 px-1 text-sm leading-relaxed text-ink-400">
        Removing a device signs it out immediately and asks for your password and a one-time
        code the next time it's used.
      </p>

      <Sheet
        open={pending !== null && stage === "confirm"}
        onClose={() => setPending(null)}
        title={
          pending?.kind === "all"
            ? "Sign out all other devices?"
            : `Remove ${pending?.kind === "one" ? pending.device.name : "device"}?`
        }
        description={
          pending?.kind === "all"
            ? `${others.length} device${others.length === 1 ? "" : "s"} will be signed out. This device stays signed in.`
            : "This device will be signed out straight away and will need full verification to return."
        }
      >
        <div className="flex flex-col gap-2 pt-1">
          <Button variant="danger" block onClick={() => setStage("verify")}>
            {pending?.kind === "all" ? "Sign out others" : "Remove device"}
          </Button>
          <Button variant="ghost" block onClick={() => setPending(null)}>
            Keep as is
          </Button>
        </div>
      </Sheet>

      <PasscodeGate
        open={pending !== null && stage === "verify"}
        onClose={() => setPending(null)}
        onVerified={run}
        reason="Confirm your passcode to change which devices can access your account."
      />
    </div>
  );
}
