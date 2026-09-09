import { cn, initials } from "@/lib/utils";

/** Initial-based avatar — consistent identity treatment without stock photos. */
export function Avatar({
  name,
  size = "md",
  tone = "navy",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "navy" | "muted";
  className?: string;
}) {
  const sizes = {
    sm: "h-8 w-8 rounded-sm text-[10px]",
    md: "h-10 w-10 rounded-lg text-xs",
    lg: "h-12 w-12 rounded-lg text-sm",
    xl: "h-16 w-16 rounded-xl text-lg",
  } as const;
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-semibold",
        tone === "navy" ? "bg-ink-900 text-brass-200" : "bg-ink-50 text-ink-600",
        sizes[size],
        className
      )}
    >
      {initials(name)}
    </span>
  );
}
