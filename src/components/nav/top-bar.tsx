"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { useBank } from "@/lib/store";
import { unreadCount } from "@/lib/selectors";
import { cn, firstName, greeting, initials } from "@/lib/utils";

/** Sticky app header: identity on the left, search / alerts / you on the right. */
export function TopBar() {
  const user = useBank((s) => s.user);
  const unread = useBank(unreadCount);

  return (
    <header className="sticky top-0 z-40 -mx-4 mb-4 border-b border-line/70 bg-canvas/85 px-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:mx-0 lg:border-none lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
      <div className="flex h-14 items-center justify-between gap-3 lg:h-16">
        <Link href="/home" className="flex items-center gap-2.5 lg:hidden" aria-label="Auremont Bank home">
          <LogoMark className="h-[30px] w-[30px]" />
          <span className="text-[13px] font-semibold tracking-[0.2em] text-ink-900">
            AUREMONT
          </span>
        </Link>

        <div className="hidden min-w-0 lg:block">
          <p className="text-xs font-medium text-ink-400">{greeting()},</p>
          <p className="truncate text-xl font-semibold tracking-tight text-ink-900">
            {firstName(user.name)}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <IconLink href="/search" label="Search">
            <Search className="h-[18px] w-[18px]" />
          </IconLink>
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
