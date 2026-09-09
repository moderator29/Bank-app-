"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogoMark } from "@/components/brand/logo";
import { Keypad, PasscodeDots } from "@/components/auth/keypad";
import { useBank } from "@/lib/store";
import { firstName, greeting } from "@/lib/utils";

export default function PasscodePage() {
  const router = useRouter();
  const hydrated = useBank((s) => s.hydrated);
  const stage = useBank((s) => s.authStage);
  const user = useBank((s) => s.user);
  const biometric = useBank((s) => s.preferences.biometric);
  const verify = useBank((s) => s.verifyPasscode);
  const signOut = useBank((s) => s.signOut);

  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [shake, setShake] = React.useState(false);
  const [attempts, setAttempts] = React.useState(0);

  React.useEffect(() => {
    if (!hydrated) return;
    if (stage === "authenticated") router.replace("/home");
    else if (stage === "signed-out") router.replace("/signin");
  }, [hydrated, stage, router]);

  const submit = React.useCallback(
    (value: string) => {
      if (verify(value)) {
        router.push("/home");
        return;
      }
      const next = attempts + 1;
      setAttempts(next);
      setShake(true);
      setError(
        next >= 3
          ? "That passcode isn't right. After five attempts we'll lock the app for your security."
          : "That passcode isn't right. Try again."
      );
      window.setTimeout(() => {
        setShake(false);
        setCode("");
      }, 640);
    },
    [attempts, router, verify]
  );

  const press = (digit: string) => {
    if (shake || code.length >= 6) return;
    const next = code + digit;
    setCode(next);
    setError(null);
    if (next.length === 6) window.setTimeout(() => submit(next), 150);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-1 flex-col py-10"
    >
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <LogoMark className="h-12 w-12" />
        <p className="mt-5 text-sm font-medium text-ink-400">
          {greeting()}, {firstName(user.name)}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
          Enter your passcode
        </h1>

        <div className="mt-9 w-full max-w-[16rem]">
          <PasscodeDots length={6} filled={code.length} error={shake} />
        </div>

        <div className="mt-5 h-10 px-4">
          {error && (
            <p role="alert" className="text-sm font-medium text-neg-500">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[19rem] pb-4">
        <Keypad
          onKey={press}
          onBackspace={() => {
            setCode((c) => c.slice(0, -1));
            setError(null);
          }}
          onBiometric={biometric ? () => submit(useBank.getState().passcode) : undefined}
          disabled={shake}
        />
        <button
          onClick={() => {
            signOut();
            router.push("/signin");
          }}
          className="press mx-auto mt-6 block rounded-sm px-3 py-2 text-sm font-semibold text-ink-500 hover:text-ink-900"
        >
          Sign in to a different account
        </button>
      </div>
    </motion.div>
  );
}
