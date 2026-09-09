"use client";

import * as React from "react";
import { History, MapPin, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, IconTile, Chip } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { PasscodeGate } from "@/components/ui/passcode-gate";
import { useBank } from "@/lib/store";
import type { LoginEvent } from "@/lib/types";
import { formatDate, formatTime, relativeDay } from "@/lib/utils";

function groupEvents(events: LoginEvent[]) {
  const groups: { label: string; items: LoginEvent[] }[] = [];
  for (const e of [...events].sort((a, b) => +new Date(b.date) - +new Date(a.date))) {
    const label = relativeDay(e.date);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(e);
    else groups.push({ label, items: [e] });
  }
  return groups;
}

export default function SignInActivityPage() {
  const loginEvents = useBank((s) => s.loginEvents);
  const reportLoginEvent = useBank((s) => s.reportLoginEvent);

  const [pending, setPending] = React.useState<LoginEvent | null>(null);
  const [stage, setStage] = React.useState<"confirm" | "verify">("confirm");

  const groups = groupEvents(loginEvents);
  const blocked = loginEvents.filter((e) => e.status === "blocked").length;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader
        title="Sign-in activity"
        subtitle="The last 25 attempts on your account"
        back="/security"
      />

      {blocked > 0 && (
        <Surface index={0} variant="sunken" className="mb-5 flex items-start gap-3 p-4">
          <ShieldAlert className="mt-0.5 h-[18px] w-[18px] shrink-0 text-warn-500" />
          <p className="text-sm leading-relaxed text-ink-500">
            {blocked} attempt{blocked === 1 ? " was" : "s were"} blocked before reaching your
            account. Nothing further is needed from you — we keep watching for the same
            pattern.
          </p>
        </Surface>
      )}

      {groups.length === 0 ? (
        <EmptyState
          icon={History}
          title="No sign-ins recorded"
          body="Sign-ins appear here as soon as your account is opened on any device."
        />
      ) : (
        <div className="space-y-5">
          {groups.map((group, gi) => (
            <section key={group.label}>
              <h2 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-[0.09em] text-ink-400">
                {group.label}
              </h2>
              <Surface index={gi} className="divide-y divide-line overflow-hidden p-0">
                {group.items.map((event) => {
                  const ok = event.status === "success";
                  return (
                    <div key={event.id} className="flex items-start gap-3 px-4 py-3.5">
                      <IconTile tone={ok ? "neutral" : "neg"}>
                        {ok ? <History /> : <ShieldAlert />}
                      </IconTile>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-base font-medium text-ink-900">
                            {event.device}
                          </p>
                          <Chip tone={ok ? "pos" : "neg"}>{ok ? "Signed in" : "Blocked"}</Chip>
                        </div>
                        <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-ink-400">
                          <MapPin className="h-4 w-4 shrink-0" />
                          {event.location}
                        </p>
                        <p className="mt-1 text-sm text-ink-400">
                          {formatDate(event.date, "medium")} at{" "}
                          <span className="tnum">{formatTime(event.date)}</span> · {event.method}
                        </p>
                        {ok && (
                          <Button
                            variant="ghost"
                            size="xs"
                            className="-ml-3 mt-1.5"
                            onClick={() => {
                              setPending(event);
                              setStage("confirm");
                            }}
                          >
                            This wasn&apos;t me
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </Surface>
            </section>
          ))}
        </div>
      )}

      <Sheet
        open={pending !== null && stage === "confirm"}
        onClose={() => setPending(null)}
        title="Report this sign-in?"
        description={
          pending
            ? `${pending.device} · ${pending.location} · ${formatDate(pending.date, "medium")}`
            : undefined
        }
      >
        <div className="pt-1">
          <p className="text-sm leading-relaxed text-ink-500">
            We&apos;ll lock that session out of your account straight away and open a security
            review. Our team follows up within 24 hours. Changing your passcode afterwards is a
            sensible next step.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="danger" block onClick={() => setStage("verify")}>
              Report and lock it out
            </Button>
            <Button variant="ghost" block onClick={() => setPending(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Sheet>

      <PasscodeGate
        open={pending !== null && stage === "verify"}
        onClose={() => setPending(null)}
        onVerified={() => {
          if (pending) reportLoginEvent(pending.id);
          setPending(null);
        }}
        reason="Confirm your passcode to report this sign-in."
      />
    </div>
  );
}
