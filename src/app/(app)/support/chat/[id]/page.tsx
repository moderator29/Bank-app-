"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessagesSquare, SendHorizontal } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, Chip } from "@/components/ui/surface";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useBank } from "@/lib/store";
import { cn, formatTime, relativeDay } from "@/lib/utils";

const SUGGESTIONS = [
  "When will my transfer arrive?",
  "How do I freeze my card?",
  "Where can I find my statement?",
];

export default function SupportConversationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const thread = useBank((s) => s.supportThreads.find((t) => t.id === id));
  const sendSupportMessage = useBank((s) => s.sendSupportMessage);

  const [draft, setDraft] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const endRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const messages = React.useMemo(
    () => (thread ? thread.messages.filter((m) => m.body.trim().length > 0) : []),
    [thread]
  );
  const last = messages[messages.length - 1];

  // The agent answers a beat after you write — show that they're composing.
  React.useEffect(() => {
    if (!last || last.from === "agent") {
      setTyping(false);
      return;
    }
    const age = Date.now() - +new Date(last.at);
    if (age > 4000) return;
    setTyping(true);
    const t = window.setTimeout(() => setTyping(false), Math.max(600, 2400 - age));
    return () => window.clearTimeout(t);
  }, [last]);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typing]);

  const send = (body: string) => {
    const value = body.trim();
    if (!value || !thread) return;
    sendSupportMessage(thread.id, value);
    setDraft("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  if (!thread) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <PageHeader title="Conversation" back="/support/chat" />
        <EmptyState
          icon={MessagesSquare}
          title="That conversation has closed"
          body="It may have been resolved and archived. Your other conversations are all still here."
          action={
            <Button variant="secondary" onClick={() => router.push("/support/chat")}>
              Back to conversations
            </Button>
          }
        />
      </div>
    );
  }

  let lastDay = "";

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader title={thread.subject} back="/support/chat" />

      <Surface index={0} className="mb-5 flex items-center gap-3 p-4">
        <Avatar name={thread.agent} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-ink-900">{thread.agent}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-400">
            <span aria-hidden className="h-1.5 w-1.5 rounded-3xl bg-pos-500" />
            Auremont Support · Online
          </p>
        </div>
        <Chip tone={thread.status === "open" ? "brass" : "neutral"}>
          {thread.status === "open" ? "Open" : "Resolved"}
        </Chip>
      </Surface>

      <div className="space-y-3">
        {messages.map((m) => {
          const day = relativeDay(m.at);
          const showDay = day !== lastDay;
          lastDay = day;
          const mine = m.from === "customer";
          return (
            <React.Fragment key={m.id}>
              {showDay && (
                <p className="py-1 text-center text-2xs font-semibold uppercase tracking-[0.09em] text-ink-300">
                  {day}
                </p>
              )}
              <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] sm:max-w-[75%]", mine ? "text-right" : "")}>
                  <div
                    className={cn(
                      "rounded-2xl px-3.5 py-2.5 text-left text-base leading-relaxed",
                      mine
                        ? "bg-action text-action-fg"
                        : "border border-line bg-surface text-ink-800 shadow-e1"
                    )}
                  >
                    {m.body}
                  </div>
                  <p className="mt-1 px-1 text-2xs text-ink-300">
                    {mine ? "You" : thread.agent} · {formatTime(m.at)}
                  </p>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {typing && (
          <div className="flex justify-start">
            <div
              className="flex items-center gap-1.5 rounded-2xl border border-line bg-surface px-4 py-3 shadow-e1"
              aria-label={`${thread.agent} is typing`}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-3xl bg-ink-300"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {messages.length <= 2 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="press rounded-3xl border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink-600 shadow-e1 hover:border-line-strong hover:text-ink-900"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="sticky bottom-20 z-30 mt-5 lg:bottom-4">
        <div className="flex items-end gap-2 rounded-2xl border border-line bg-surface p-2 shadow-e2">
          <textarea
            ref={inputRef}
            value={draft}
            rows={1}
            placeholder="Write a message"
            aria-label="Write a message"
            onChange={(e) => {
              setDraft(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 132)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
            className="max-h-33 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-base text-ink-900 placeholder:text-ink-300 focus:outline-none"
          />
          <Button
            size="icon"
            aria-label="Send message"
            disabled={draft.trim().length === 0}
            onClick={() => send(draft)}
          >
            <SendHorizontal className="h-[18px] w-[18px]" />
          </Button>
        </div>
        <p className="mt-2 px-1 text-center text-2xs text-ink-300">
          Never share your passcode or a one-time code — we will never ask for them.
        </p>
      </div>
    </div>
  );
}
