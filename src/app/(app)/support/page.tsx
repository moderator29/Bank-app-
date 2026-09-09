"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Flag, MessageSquare, Phone, Search, X } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, IconTile, SectionHeader } from "@/components/ui/surface";
import { ListGroup, ListRow } from "@/components/ui/list";
import { Input, Field } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { useBank } from "@/lib/store";
import { SUPPORT_TOPICS, searchArticles } from "@/components/support/articles";

type ProblemCategory = "payments" | "cards" | "app" | "other";

const PROBLEM_OPTIONS: { value: ProblemCategory; label: string }[] = [
  { value: "payments", label: "Payments" },
  { value: "cards", label: "Cards" },
  { value: "app", label: "The app" },
  { value: "other", label: "Something else" },
];

export default function SupportPage() {
  const router = useRouter();
  const threads = useBank((s) => s.supportThreads);
  const startSupportThread = useBank((s) => s.startSupportThread);

  const [query, setQuery] = React.useState("");
  const [callOpen, setCallOpen] = React.useState(false);
  const [problemOpen, setProblemOpen] = React.useState(false);

  const results = React.useMemo(() => searchArticles(query), [query]);
  const searching = query.trim().length >= 2;
  const openThreads = threads.filter((t) => t.status === "open").length;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title="Help centre"
        subtitle="Answers to the questions we're asked most, and a way to reach us"
        back="/profile"
      />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-300" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help articles"
          aria-label="Search help articles"
          className="pl-11 pr-11"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="press absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-800"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {searching ? (
        <div className="mt-5">
          {results.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No articles match that"
              body="Try a different word, or start a conversation and we'll answer it directly."
              action={
                <Button variant="secondary" onClick={() => router.push("/support/chat")}>
                  Start a conversation
                </Button>
              }
              compact
            />
          ) : (
            <ListGroup label={`${results.length} result${results.length === 1 ? "" : "s"}`}>
              {results.map((a) => (
                <ListRow
                  key={a.id}
                  title={a.title}
                  detail={a.summary}
                  href={`/support/${a.topic}#${a.id}`}
                />
              ))}
            </ListGroup>
          )}
        </div>
      ) : (
        <>
          <div className="mt-6">
            <SectionHeader title="Popular topics" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SUPPORT_TOPICS.map((topic, i) => (
                <Link key={topic.id} href={`/support/${topic.id}`} className="press block">
                  <Surface index={i} className="h-full p-4 hover:border-line-strong">
                    <IconTile tone="neutral">
                      <topic.icon />
                    </IconTile>
                    <p className="mt-3 text-base font-semibold text-ink-900">{topic.label}</p>
                    <p className="mt-0.5 text-sm leading-snug text-ink-400">{topic.blurb}</p>
                  </Surface>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <ListGroup label="Contact us">
              <ListRow
                icon={
                  <IconTile tone="navy">
                    <MessageSquare />
                  </IconTile>
                }
                title="Start a chat"
                detail={
                  openThreads > 0
                    ? `${openThreads} conversation${openThreads === 1 ? "" : "s"} open`
                    : "Typical reply in a few minutes"
                }
                href="/support/chat"
              />
              <ListRow
                icon={
                  <IconTile tone="neutral">
                    <Phone />
                  </IconTile>
                }
                title="Call us"
                detail="Card and fraud support, 24 hours"
                onClick={() => setCallOpen(true)}
              />
              <ListRow
                icon={
                  <IconTile tone="neutral">
                    <Flag />
                  </IconTile>
                }
                title="Report a problem"
                detail="Something in the app isn't working as it should"
                onClick={() => setProblemOpen(true)}
              />
            </ListGroup>
          </div>
        </>
      )}

      <Sheet
        open={callOpen}
        onClose={() => setCallOpen(false)}
        title="Call Auremont"
        description="Have your account ready — we'll confirm your identity before we start."
      >
        <div className="space-y-3 pt-1">
          <div className="rounded-xl bg-surface-sunken px-4 py-3.5">
            <p className="text-2xs font-semibold uppercase tracking-[0.09em] text-ink-400">
              General banking
            </p>
            <p className="tnum mt-1 text-xl font-semibold text-ink-900">1-800-555-0142</p>
            <p className="mt-0.5 text-sm text-ink-400">Mon–Fri 7am–10pm ET · Sat–Sun 8am–6pm ET</p>
          </div>
          <div className="rounded-xl bg-surface-sunken px-4 py-3.5">
            <p className="text-2xs font-semibold uppercase tracking-[0.09em] text-ink-400">
              Lost card or fraud
            </p>
            <p className="tnum mt-1 text-xl font-semibold text-ink-900">1-800-555-0199</p>
            <p className="mt-0.5 text-sm text-ink-400">Answered 24 hours, every day</p>
          </div>
          <p className="text-sm leading-relaxed text-ink-400">
            We will never call you to ask for your passcode or a one-time code. If in doubt,
            hang up and call the number above.
          </p>
        </div>
      </Sheet>

      <ReportProblemSheet
        open={problemOpen}
        onClose={() => setProblemOpen(false)}
        onSubmit={(subject, body) => startSupportThread(subject, body)}
      />
    </div>
  );
}

function ReportProblemSheet({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (subject: string, body: string) => string;
}) {
  const router = useRouter();
  const [category, setCategory] = React.useState<ProblemCategory>("payments");
  const [detail, setDetail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [threadId, setThreadId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setCategory("payments");
    setDetail("");
    setError(null);
    setThreadId(null);
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (detail.trim().length < 12) {
      setError("Tell us a little more — at least a sentence helps us find it faster.");
      return;
    }
    const label = PROBLEM_OPTIONS.find((o) => o.value === category)?.label ?? "Support";
    setThreadId(onSubmit(`Problem report · ${label}`, detail.trim()));
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={threadId ? "Thanks — we're on it" : "Report a problem"}
      description={
        threadId ? undefined : "Tell us what happened and we'll come back to you in the app."
      }
    >
      {threadId ? (
        <div className="pt-1">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pos-50 text-pos-500">
              <Check className="h-[18px] w-[18px]" />
            </span>
            <p className="text-sm leading-relaxed text-ink-500">
              Your report has been logged and a conversation opened. We&apos;ll reply there, and
              you&apos;ll get a notification as soon as we do.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              block
              onClick={() => {
                onClose();
                router.push(`/support/chat/${threadId}`);
              }}
            >
              Open the conversation
            </Button>
            <Button variant="ghost" block onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4 pt-1" noValidate>
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-ink-500">
              What&apos;s it about?
            </span>
            <Segmented
              id="problem"
              options={PROBLEM_OPTIONS}
              value={category}
              onChange={setCategory}
            />
          </div>
          <Field label="What happened?" error={error}>
            <textarea
              value={detail}
              onChange={(e) => {
                setDetail(e.target.value);
                setError(null);
              }}
              rows={4}
              placeholder="Describe what you were doing and what went wrong."
              className="w-full resize-none rounded-md border border-line-strong bg-surface px-3.5 py-3 text-base text-ink-900 placeholder:text-ink-300 focus:border-ink-700 focus:outline-none focus:ring-4 focus:ring-ink-900/8"
            />
          </Field>
          <Button type="submit" block>
            Send report
          </Button>
        </form>
      )}
    </Sheet>
  );
}
