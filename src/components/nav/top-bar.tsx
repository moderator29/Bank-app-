"use client";

import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { useBank } from "@/lib/store";
import { unreadCount } from "@/lib/selectors";
import { cn, firstName, greeting, initials } from "@/lib/utils";

/** Sticky app header: identity on the left, search / alerts / you on the right. */
export function TopBar({ onMenu }: { onMenu: () => void }) {
  const user = useBank((s) => s.user);
  const unread = useBank(unreadCount);

  return (
    <header className="sticky top-0 z-40 -mx-4 mb-4 px-4 backdrop-blur-2xl backdrop-saturate-150 [mask-image:linear-gradient(180deg,#000_0%,#000_72%,transparent_100%)] sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 lg:backdrop-blur-none lg:[mask-image:none]">
      <div className="flex h-14 items-center justify-between gap-3 lg:h-16">
        <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
          <button
            onClick={onMenu}
            aria-label="Open menu"
            className="press flex h-10 w-10 items-center justify-center rounded-md border border-line-strong bg-surface/55 text-ink-800 backdrop-blur-sm hover:bg-surface/80"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>
          <Link href="/home" className="flex items-center gap-2" aria-label="Auremont Bank home">
            <LogoMark className="h-[30px] w-[30px]" />
            <span className="font-display text-[15px] font-semibold tracking-[0.2em] text-ink-900">
              AUREMONT
            </span>
          </Link>
        </div>

        <div className="hidden min-w-0 lg:block">
          <p className="text-xs font-medium text-ink-400">{greeting()},</p>
          <p className="truncate text-xl font-semibold tracking-tight text-ink-900">
            {firstName(user.name)}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <IconLink href="/notifications" label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
            <Bell className="h-[18px] w-[18px]" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-3xl bg-neg-500 px-1 text-[9px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </IconLink>
          <Link
            href="/profile"
            aria-label="Your profile"
            className="press ml-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-ink-900 text-[11px] font-semibold text-brass-200 lg:hidden"
          >
            {initials(user.name)}
          </Link>
        </div>
      </div>
    </header>
  );
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "press relative flex h-9 w-9 items-center justify-center rounded-md text-ink-500",
        "hover:bg-ink-50 hover:text-ink-900"
      )}
    >
      {children}
    </Link>
  );
}
