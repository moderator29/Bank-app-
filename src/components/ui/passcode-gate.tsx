"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { Sheet } from "./sheet";
import { Keypad, PasscodeDots } from "@/components/auth/keypad";
import { useBank } from "@/lib/store";

/**
 * Confirms identity before a sensitive action (revealing a card number,
 * changing security settings, moving a large amount).
 */
export function PasscodeGate({
  open,
  onClose,
  onVerified,
  reason,
}: {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
  reason: string;
}) {
  const checkPasscode = useBank((s) => s.checkPasscode);
  const biometric = useBank((s) => s.preferences.biometric);
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setCode("");
      setError(false);
    }
  }, [open]);

  const submit = React.useCallback(
    (value: string) => {
      if (checkPasscode(value)) {
        onVerified();
        onClose();
      } else {
        setError(true);
        window.setTimeout(() => {
          setCode("");
          setError(false);
        }, 620);
      }
    },
    [checkPasscode, onClose, onVerified]
  );

  const press = (digit: string) => {
    if (error || code.length >= 6) return;
    const next = code + digit;
    setCode(next);
    if (next.length === 6) window.setTimeout(() => submit(next), 140);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Confirm it's you" description={reason}>
      <div className="pt-1">
        <div className="mb-5 flex items-center justify-center gap-2 text-xs font-medium text-ink-400">
          <ShieldCheck className="h-4 w-4 text-brass-500" />
          Enter your 6-digit passcode
        </div>
        <div className="mb-6">
          <PasscodeDots length={6} filled={code.length} error={error} />
        </div>
        <Keypad
          onKey={press}
          onBackspace={() => setCode((c) => c.slice(0, -1))}
          onBiometric={biometric ? () => submit(useBank.getState().passcode) : undefined}
          disabled={error}
        />
      </div>
    </Sheet>
  );
}
