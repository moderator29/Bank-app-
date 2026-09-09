import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn("h-10 w-10", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="v-glass" x1="6" y1="4" x2="42" y2="44">
          <stop offset="0%" stopColor="#e8f7f0" />
          <stop offset="55%" stopColor="#c7d8d2" />
          <stop offset="100%" stopColor="#9fb8b0" />
        </linearGradient>
        <linearGradient id="v-gold" x1="20" y1="14" x2="30" y2="36">
          <stop offset="0%" stopColor="#f0c96a" />
          <stop offset="100%" stopColor="#c89b3c" />
        </linearGradient>
      </defs>
      <path
        d="M8 10 L24 4 L40 10 L40 26 L24 44 L8 26 Z"
        fill="url(#v-glass)"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.95"
      />
      <path
        d="M8 10 L24 16 L40 10 L24 4 Z"
        fill="#ffffff"
        opacity="0.45"
      />
      <path
        d="M17 15 L24 32 L31 15 L27.5 15 L24 24.5 L20.5 15 Z"
        fill="url(#v-gold)"
      />
    </svg>
  );
}

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="h-9 w-9 drop-shadow-sm" />
      {!compact && (
        <div className="leading-none">
          <span className="text-lg font-extrabold tracking-[0.18em] text-ink-900">
            ECOKRIPTO
          </span>
          <p className="mt-1 text-[8px] font-semibold tracking-[0.14em] text-ink-400">
            SMART MONEY. <span className="text-brand-500">LIMITLESS FUTURE.</span>
          </p>
        </div>
      )}
    </div>
  );
}
