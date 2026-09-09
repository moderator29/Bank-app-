"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBank } from "@/lib/store";
import { BootScreen } from "@/components/shell/boot-screen";

/** Entry point: routes into the app, the passcode lock, or sign-in. */
export default function Index() {
  const router = useRouter();
  const hydrated = useBank((s) => s.hydrated);
  const stage = useBank((s) => s.authStage);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(
      stage === "authenticated" ? "/home" : stage === "passcode" ? "/passcode" : "/signin"
    );
  }, [hydrated, stage, router]);

  return <BootScreen />;
}
