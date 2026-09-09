"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, MessagesSquare, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, Chip } from "@/components/ui/surface";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Field, Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { useBank } from "@/lib/store";
import { relativeDay } from "@/lib/utils";

export default function SupportChatListPage() {
  const router = useRouter();
  const threads = useBank((s) => s.supportThreads);
  const [newOpen, setNewOpen] = React.useState(false);

  const sorted = React.useMemo(
    () => [...threads].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [threads]
  );

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader
        title="Conversations"
        subtitle="Messages between you and the Auremont support team"
        back="/support"
        action={
          threads.length > 0 ? (
            <Button variant="secondary" size="sm" onClick={() => setNewOpen(true)}>
              <Plus className="h-4 w-4" />
              New
            </Button>
          ) : undefined
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="No conversations yet"
          body="Ask us anything about your accounts, cards or payments. We keep every conversation here so you can pick it back up whenever you like."
          action={<Button onClick={() => setNewOpen(true)}>Start a conversation</Button>}
        />
      ) : (
        <Surface index={0} className="divide-y divide-line overflow-hidden">
          {sorted.map((thread) => {
            const messages = thread.messages.filter((m) => m.body.trim().length > 0);
            const last = messages[messages.length - 1];
            return (
              <Link
                key={thread.id}
                href={`/support/chat/${thread.id}`}
                className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-ink-25 active:bg-ink-50"
              >
                <Avatar name={thread.agent} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="min-w-0 flex-1 truncate text-base font-semibold text-ink-900">
                      {thread.subject}
                    </p>
                    <span className="shrink-0 text-2xs text-ink-300">
                      {relativeDay(thread.updatedAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-ink-400">
                    {last
                      ? `${last.from === "customer" ? "You: " : `${thread.agent}: `}${last.body}`
                      : "No messages yet"}
                  </p>
                  <div className="mt-1.5">
                    <Chip tone={thread.status === "open" ? "brass" : "neutral"}>
                      {thread.status === "open" ? "Open" : "Resolved"}
                    </Chip>
                  </div>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-ink-300" />
              </Link>
            );
          })}
        </Surface>
      )}

      <p className="mt-5 px-1 text-sm leading-relaxed text-ink-400">
        Conversations are answered by the Auremont support team in the order they arrive. For a
        lost card or suspected fraud, call us instead — that line is answered 24 hours.
      </p>

      <NewConversationSheet
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={(id) => router.push(`/support/chat/${id}`)}
      />
    </div>
  );
}

function NewConversationSheet({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const startSupportThread = useBank((s) => s.startSupportThread);
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [errors, setErrors] = React.useState<{ subject?: string; message?: string }>({});

  React.useEffect(() => {
    if (!open) return;
    setSubject("");
    setMessage("");
    setErrors({});
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: { subject?: string; message?: string } = {};
    if (subject.trim().length < 3) next.subject = "Give your conversation a short subject.";
    if (message.trim().length < 10) next.message = "Add a little detail so we can help first time.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const id = startSupportThread(subject.trim(), message.trim());
    onClose();
    onCreated(id);
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="New conversation"
      description="Tell us what you need and we'll reply in the app."
    >
      <form onSubmit={submit} className="space-y-3 pt-1" noValidate>
        <Field label="Subject" error={errors.subject}>
          <Input
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setErrors((x) => ({ ...x, subject: undefined }));
            }}
            placeholder="Card replacement"
          />
        </Field>
        <Field label="Message" error={errors.message}>
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setErrors((x) => ({ ...x, message: undefined }));
            }}
            rows={4}
            placeholder="Describe what you'd like help with."
            className="w-full resize-none rounded-md border border-line-strong bg-surface px-3.5 py-3 text-base text-ink-900 placeholder:text-ink-300 focus:border-ink-700 focus:outline-none focus:ring-4 focus:ring-ink-900/8"
          />
        </Field>
        <Button type="submit" block className="mt-1">
          Send message
        </Button>
      </form>
    </Sheet>
  );
}
