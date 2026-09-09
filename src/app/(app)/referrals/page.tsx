"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Share2,
  UserPlus,
  Gift,
  Users,
  Copy,
  Check,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { useEcokripto } from "@/lib/store";

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Share2,
    title: "Share your code",
    body: "Send your referral code to a friend.",
  },
  {
    icon: UserPlus,
    title: "Friend creates an account",
    body: "They sign up and start saving with Ecokripto.",
  },
  {
    icon: Gift,
    title: "You both get rewarded",
    body: "Each of you receives a $25 bonus.",
  },
];

function referralCode(email: string | undefined): string {
  const prefix = (email ?? "saver")
    .split("@")[0]
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 6);
  return `ECOKRIPTO-${prefix || "SAVER"}`;
}

export default function ReferralsPage() {
  const user = useEcokripto((s) => s.user);
  const [copied, setCopied] = useState(false);

  const code = referralCode(user?.email);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — silently ignore in demo.
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referrals"
        subtitle="Invite friends, grow together"
      />

      {/* Invite hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-deep rounded-4xl text-white shadow-float-lg p-6 sm:p-8"
      >
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
            Referral program
          </p>
          <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight">
            Invite &amp; Earn
          </h2>
          <p className="mt-2 max-w-md text-sm text-white/70">
            Earn a $25 bonus for each friend who joins and saves.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/10 px-5 py-3.5 backdrop-blur-sm sm:min-w-72">
              <span className="font-mono text-lg font-semibold tracking-widest">
                {code}
              </span>
            </div>
            <Button
              variant="secondary"
              size="md"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy code
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* How it works */}
      <section className="space-y-3">
        <h3 className="text-lg font-extrabold tracking-tight text-ink-900">
          How it works
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <GlassCard
              key={step.title}
              delay={Math.min(i * 0.08, 0.4)}
              className="p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-[0_6px_16px_-4px_rgb(22_136_96/0.45)]">
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-extrabold text-brand-700">
                  {i + 1}
                </span>
              </div>
              <p className="mt-4 font-extrabold tracking-tight text-ink-900">
                {step.title}
              </p>
              <p className="mt-1 text-sm text-ink-600">{step.body}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Your referrals */}
      <section className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Friends invited"
            value={0}
            icon={Users}
            format="number"
            delay={0.1}
          />
          <StatCard
            label="Referral earnings"
            value={0}
            icon={Wallet}
            format="currency"
            delay={0.18}
          />
        </div>
        <EmptyState
          icon={Users}
          title="No referrals yet"
          body="Share your code to start earning."
        />
      </section>
    </div>
  );
}
