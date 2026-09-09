import { cn } from "@/lib/utils";

/**
 * The Auremont monogram — a brass apex ("A" as a mountain peak) struck into a
 * navy field, with a hairline keyline. Used at every size from the tab bar to
 * the sign-in screen.
 */
export function LogoMark({
  className,
  tone = "navy",
}: {
  className?: string;
  tone?: "navy" | "light" | "mono";
}) {
  const field =
    tone === "navy" ? "url(#aur-field)" : tone === "light" ? "#ffffff" : "transparent";
  const apex = tone === "light" ? "url(#aur-brass-deep)" : "url(#aur-brass)";
  const keyline = tone === "light" ? "rgba(13,26,44,0.10)" : "rgba(226,205,163,0.30)";

  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn("h-9 w-9", className)} aria-hidden>
      <defs>
        <linearGradient id="aur-field" x1="4" y1="2" x2="36" y2="38">
          <stop offset="0%" stopColor="#1e3350" />
          <stop offset="55%" stopColor="#0d1a2c" />
          <stop offset="100%" stopColor="#071120" />
        </linearGradient>
        <linearGradient id="aur-brass" x1="12" y1="9" x2="28" y2="31">
          <stop offset="0%" stopColor="#e8d3a6" />
          <stop offset="45%" stopColor="#d4b781" />
          <stop offset="100%" stopColor="#ad8845" />
        </linearGradient>
        <linearGradient id="aur-brass-deep" x1="12" y1="9" x2="28" y2="31">
          <stop offset="0%" stopColor="#c2a05f" />
          <stop offset="100%" stopColor="#8f6e36" />
        </linearGradient>
      </defs>

      <rect x="0.5" y="0.5" width="39" height="39" rx="11" fill={field} />
      <rect x="3.25" y="3.25" width="33.5" height="33.5" rx="8.5" stroke={keyline} strokeWidth="1" />

      {/* Apex: the two rising strokes of the A, cut by a level bar. */}
      <path d="M20 9.4 L29.6 30.6 H25.7 L20 17.6 L14.3 30.6 H10.4 Z" fill={apex} />
      <rect x="15.6" y="23.4" width="8.8" height="2.9" rx="1.45" fill={apex} />
    </svg>
  );
}

export function Wordmark({
  className,
  tone = "navy",
}: {
  className?: string;
  tone?: "navy" | "light";
}) {
  return (
    <span className={cn("leading-none", className)}>
      <span
        className={cn(
          "block text-[15px] font-semibold tracking-[0.26em]",
          tone === "light" ? "text-white" : "text-ink-900"
        )}
      >
        AUREMONT
      </span>
      <span
        className={cn(
          "mt-[3px] block text-[8px] font-medium tracking-[0.42em]",
          tone === "light" ? "text-brass-200/80" : "text-brass-500"
        )}
      >
        BANK
      </span>
    </span>
  );
}

export function Logo({
  className,
  tone = "navy",
  size = "md",
}: {
  className?: string;
  tone?: "navy" | "light";
  size?: "sm" | "md" | "lg";
}) {
  const mark = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-8 w-8" : "h-9 w-9";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={mark} tone={tone === "light" ? "light" : "navy"} />
      <Wordmark tone={tone} />
    </span>
  );
}
