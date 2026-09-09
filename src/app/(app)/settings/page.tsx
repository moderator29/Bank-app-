"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/shared/page-header";
import { useEcokripto } from "@/lib/store";
import { cn } from "@/lib/utils";

function Toggle({
  on,
  onToggle,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        "relative flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full px-0.5 transition-colors duration-300",
        on ? "justify-end bg-brand-500" : "justify-start bg-ink-400/30"
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="h-5 w-5 rounded-full bg-white shadow-sm"
      />
    </button>
  );
}

function ToggleRow({
  label,
  description,
  on,
  onToggle,
}: {
  label: string;
  description: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-semibold text-ink-900">{label}</p>
        <p className="mt-0.5 text-xs text-ink-400">{description}</p>
      </div>
      <Toggle on={on} onToggle={onToggle} label={label} />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
      {children}
    </p>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const signOut = useEcokripto((s) => s.signOut);

  const [privacyMode, setPrivacyMode] = React.useState(true);
  const [weeklySummary, setWeeklySummary] = React.useState(false);
  const [soundEffects, setSoundEffects] = React.useState(false);
  const [productUpdates, setProductUpdates] = React.useState(true);
  const [payoutAlerts, setPayoutAlerts] = React.useState(true);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const handleReset = () => {
    setConfirmOpen(false);
    signOut();
    router.replace("/dashboard");
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader
        title="Settings"
        subtitle="Preferences for your Ecokripto experience"
      />

      <div className="mt-6 flex flex-col gap-5">
        <GlassCard className="p-6" delay={0.05}>
          <SectionTitle>Preferences</SectionTitle>
          <div className="divide-y divide-ink-400/10">
            <ToggleRow
              label="Balance privacy mode"
              description="Blur balances when others may be looking."
              on={privacyMode}
              onToggle={() => setPrivacyMode((v) => !v)}
            />
            <ToggleRow
              label="Weekly summary"
              description="A recap of your savings activity every Monday."
              on={weeklySummary}
              onToggle={() => setWeeklySummary((v) => !v)}
            />
            <ToggleRow
              label="Sound effects"
              description="Gentle chimes for deposits and milestones."
              on={soundEffects}
              onToggle={() => setSoundEffects((v) => !v)}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-6" delay={0.12}>
          <SectionTitle>Notifications</SectionTitle>
          <div className="divide-y divide-ink-400/10">
            <ToggleRow
              label="Product updates"
              description="Occasional news about new Ecokripto features."
              on={productUpdates}
              onToggle={() => setProductUpdates((v) => !v)}
            />
            <ToggleRow
              label="Payout alerts"
              description="Get notified before each APY payout lands."
              on={payoutAlerts}
              onToggle={() => setPayoutAlerts((v) => !v)}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-6" delay={0.19}>
          <SectionTitle>Data &amp; privacy</SectionTitle>
          <p className="text-sm leading-relaxed text-ink-600">
            Your data is stored securely and only you can access it. You can
            reset your account at any time.
          </p>
          <div className="mt-5">
            <Button variant="outline" onClick={() => setConfirmOpen(true)}>
              Reset account data
            </Button>
          </div>
        </GlassCard>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pb-2 text-center text-xs text-ink-400"
        >
          Ecokripto &middot; v1.0.0
        </motion.p>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Reset account data?"
      >
        <p className="text-sm leading-relaxed text-ink-600">
          This clears your account data and returns you to sign-up.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReset}>
            Reset everything
          </Button>
        </div>
      </Modal>
    </div>
  );
}
