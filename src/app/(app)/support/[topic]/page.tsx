"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LifeBuoy, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, IconTile } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { articlesForTopic, topicById } from "@/components/support/articles";
import { cn } from "@/lib/utils";

export default function SupportTopicPage() {
  const params = useParams<{ topic: string }>();
  const router = useRouter();
  const id = typeof params.topic === "string" ? params.topic : "";

  const topic = topicById(id);
  const articles = topic ? articlesForTopic(topic.id) : [];
  const [open, setOpen] = React.useState<string | null>(null);

  // A search result links straight to an article — open it on arrival.
  React.useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    setOpen(hash);
    const el = document.getElementById(hash);
    if (el) window.setTimeout(() => el.scrollIntoView({ block: "center" }), 80);
  }, [id]);

  if (!topic) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <PageHeader title="Help" back="/support" />
        <EmptyState
          icon={LifeBuoy}
          title="That topic has moved"
          body="We couldn't find that section of the help centre. The full list of topics is a tap away."
          action={
            <Button variant="secondary" onClick={() => router.push("/support")}>
              Back to help centre
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader title={topic.label} subtitle={topic.blurb} back="/support" />

      <Surface index={0} className="divide-y divide-line overflow-hidden">
        {articles.map((article) => {
          const expanded = open === article.id;
          return (
            <div key={article.id} id={article.id}>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : article.id)}
                className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-ink-25"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-medium text-ink-900">
                    {article.title}
                  </span>
                  {!expanded && (
                    <span className="mt-0.5 block truncate text-sm text-ink-400">
                      {article.summary}
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0 text-ink-300 transition-transform duration-200",
                    expanded && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 px-4 pb-4">
                      {article.body.map((p, i) => (
                        <p key={i} className="text-sm leading-relaxed text-ink-500">
                          {p}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </Surface>

      <Surface index={1} variant="sunken" className="mt-5 p-5">
        <div className="flex items-start gap-3.5">
          <IconTile tone="navy" size="lg">
            <MessageSquare />
          </IconTile>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-ink-900">Still need help?</h2>
            <p className="mt-0.5 text-sm leading-relaxed text-ink-400">
              Start a conversation and we&apos;ll pick it up from here — your account details
              are already with us, so there&apos;s nothing to repeat.
            </p>
            <Button className="mt-3" size="sm" onClick={() => router.push("/support/chat")}>
              Start a conversation
            </Button>
          </div>
        </div>
      </Surface>
    </div>
  );
}
