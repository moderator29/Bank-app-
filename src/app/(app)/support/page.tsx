"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Copy, Mail, MessageCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";

const SUPPORT_EMAIL = "support@ecokripto.com";

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How is my account protected?",
    answer:
      "Your account is secured with encryption and only accessible from your signed-in session. Keep your login details private and never share them.",
  },
  {
    question: "How do deposits work?",
    answer:
      "Deposits are instant. Pick a linked account, enter an amount, and confirm — the funds are added to your balance right away with no fees.",
  },
  {
    question: "How do I reset my account?",
    answer:
      "You can reset your account any time from Settings → Data & privacy. This clears your data and returns you to sign-up.",
  },
  {
    question: "What is APY?",
    answer:
      "APY (Annual Percentage Yield) is the yearly rate your savings grow at, including compounding. Ecokripto applies a 4.25% APY to your balance.",
  },
];

export default function SupportPage() {
  const [chatNote, setChatNote] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const copyEmail = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — silently ignore in demo.
    }
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader title="Support" subtitle="We are here to help" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <GlassCard className="p-6" delay={0.05}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <MessageCircle className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-lg font-extrabold tracking-tight text-ink-900">
            Chat with us
          </h2>
          <p className="mt-1 text-sm text-ink-600">
            Typical reply: a few minutes
          </p>
          <div className="mt-5">
            <Button variant="secondary" size="md" onClick={() => setChatNote(true)}>
              Start chat
            </Button>
          </div>
          <AnimatePresence>
            {chatNote && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-xs font-semibold text-brand-700"
              >
                Chat is currently offline — please email us.
              </motion.p>
            )}
          </AnimatePresence>
        </GlassCard>

        <GlassCard className="p-6" delay={0.1}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <Mail className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-lg font-extrabold tracking-tight text-ink-900">
            Email support
          </h2>
          <p className="mt-1 text-sm text-ink-600">{SUPPORT_EMAIL}</p>
          <div className="mt-5">
            <Button variant="outline" size="md" onClick={copyEmail}>
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy email
                </>
              )}
            </Button>
          </div>
        </GlassCard>
      </div>

      <section className="space-y-3">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="text-xl font-extrabold tracking-tight text-ink-900"
        >
          Frequently asked
        </motion.h2>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const open = openIndex === index;
            return (
              <GlassCard
                key={faq.question}
                hover={false}
                delay={Math.min(0.2 + index * 0.05, 0.4)}
                className="overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-bold text-ink-900">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-ink-400 transition-transform duration-300 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-ink-600">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}
