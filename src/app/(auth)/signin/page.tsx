"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Info, Lock } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/list";
import { Sheet } from "@/components/ui/sheet";
import { useBank } from "@/lib/store";

export default function SignInPage() {
  const router = useRouter();
  const hydrated = useBank((s) => s.hydrated);
  const stage = useBank((s) => s.authStage);
  const signIn = useBank((s) => s.signIn);
  const remember = useBank((s) => s.rememberDevice);
  const setRemember = useBank((s) => s.setRememberDevice);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [reveal, setReveal] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);

  // Already through the front door — don't show it again.
  React.useEffect(() => {
    if (!hydrated) return;
    if (stage === "authenticated") router.replace("/home");
    else if (stage === "passcode") router.replace("/passcode");
  }, [hydrated, stage, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setError("Enter the email address on your account.");
    if (!password) return setError("Enter your password.");
    setBusy(true);
    setError(null);
    await new Promise((r) => window.setTimeout(r, 620));
    if (signIn(email, password)) {
      router.push("/passcode");
      return;
    }
    setBusy(false);
    setError("We couldn't verify those details. Check them and try again.");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-1 flex-col justify-center py-12"
      >
        <div className="mb-9 flex flex-col items-center text-center">
          <LogoMark className="h-14 w-14" />
          <div className="mt-4">
            <Wordmark size="lg" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Sign in</h1>
        <p className="mt-1.5 text-sm text-ink-400">
          Use the email address and password registered to your Auremont account.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
          <Field label="Email address">
            <Input
              type="email"
              autoComplete="username"
              inputMode="email"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
            />
          </Field>

          <Field label="Password">
            <div className="relative">
              <Input
                type={reveal ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setReveal((v) => !v)}
                aria-label={reveal ? "Hide password" : "Show password"}
                className="press absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-sm text-ink-400 hover:bg-ink-50 hover:text-ink-700"
              >
                {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          {error && (
            <p role="alert" className="rounded-md bg-neg-50 px-3.5 py-2.5 text-sm font-medium text-neg-600">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex min-w-0 items-center gap-2.5">
              <Toggle checked={remember} onChange={setRemember} label="Remember this device" />
              <span className="truncate text-sm text-ink-500">Remember this device</span>
            </div>
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="text-sm font-semibold text-ink-700 underline-offset-4 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" size="lg" block disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-line bg-surface px-4 py-3.5">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brass-500" />
          <p className="text-xs leading-relaxed text-ink-400">
            Auremont will never ask for your password or passcode by phone, text or email.
            Only enter them here.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-ink-400">
          New to Auremont?{" "}
          <Link href="/support" className="font-semibold text-ink-700 underline-offset-4 hover:underline">
            Talk to our team
          </Link>
        </p>
      </motion.div>

      <Sheet
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Reset your password"
        description="We'll help you get back into your account."
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-sunken p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-info-500" />
            <p className="text-sm leading-relaxed text-ink-500">
              For your security, password resets are confirmed with the phone number on your
              account. Our team can verify you and send a reset link in a few minutes.
            </p>
          </div>
          <Link href="/support">
            <Button block size="lg">
              Contact the security team
            </Button>
          </Link>
          <Button block variant="ghost" onClick={() => setHelpOpen(false)}>
            Back to sign in
          </Button>
        </div>
      </Sheet>
    </>
  );
}
