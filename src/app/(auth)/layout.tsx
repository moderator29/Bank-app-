import type { ReactNode } from "react";

/**
 * Auth canvas — a single centred column with a soft navy vignette overhead,
 * so sign-in feels like the front door of the bank rather than a form.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-canvas">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[46vh]"
        style={{
          background:
            "radial-gradient(120% 100% at 50% -30%, rgba(13,26,44,0.16) 0%, rgba(13,26,44,0.05) 42%, rgba(13,26,44,0) 72%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[68%] -translate-x-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(212,183,129,0.55), transparent)",
        }}
      />
      <main className="relative z-10 mx-auto flex w-full max-w-[27rem] flex-1 flex-col px-6 pb-safe pt-safe">
        {children}
      </main>
    </div>
  );
}
