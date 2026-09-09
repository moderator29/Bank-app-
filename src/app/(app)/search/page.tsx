"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Search as SearchIcon, X } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface } from "@/components/ui/surface";
import { Input } from "@/components/ui/input";
import { Money } from "@/components/ui/money";
import { EmptyState } from "@/components/shared/empty-state";
import { useGlobalSearch } from "@/lib/hooks";
import type { SearchHit } from "@/lib/selectors";
import { cn } from "@/lib/utils";

const RECENT_KEY = "auremont-recent-searches";
const SUGGESTIONS = ["Uber", "Netflix", "Rent", "Payroll", "Card", "Statement"];
const ORDER: SearchHit["group"][] = [
  "Transactions",
  "Accounts",
  "Cards",
  "Recipients",
  "Bills",
  "Settings",
  "Help",
];

export default function SearchPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [raw, setRaw] = React.useState(params.get("q") ?? "");
  const [query, setQuery] = React.useState(params.get("q") ?? "");
  const [recent, setRecent] = React.useState<string[]>([]);
  const [cursor, setCursor] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecent(JSON.parse(stored) as string[]);
    } catch {
      /* storage unavailable — recents are a convenience, not a requirement */
    }
  }, []);

  // Debounce so a long ledger doesn't re-filter on every keystroke.
  React.useEffect(() => {
    const t = window.setTimeout(() => setQuery(raw), 120);
    return () => window.clearTimeout(t);
  }, [raw]);

  const hits = useGlobalSearch(query);
  const flat = React.useMemo(
    () => ORDER.flatMap((group) => hits.filter((h) => h.group === group)),
    [hits]
  );

  React.useEffect(() => setCursor(-1), [query]);

  const remember = React.useCallback((term: string) => {
    const value = term.trim();
    if (value.length < 2) return;
    setRecent((prev) => {
      const next = [value, ...prev.filter((p) => p.toLowerCase() !== value.toLowerCase())].slice(0, 5);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const open = (hit: SearchHit) => {
    remember(query);
    router.push(hit.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setRaw("");
      return;
    }
    if (!flat.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % flat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c <= 0 ? flat.length - 1 : c - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      open(flat[cursor >= 0 ? cursor : 0]);
    }
  };

  const grouped = ORDER.map((group) => ({
    group,
    items: hits.filter((h) => h.group === group),
  })).filter((g) => g.items.length > 0);

  const searching = query.trim().length >= 2;

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-4">
      <PageHeader title="Search" back />

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <Input
          ref={inputRef}
          autoFocus
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Transactions, accounts, cards, help"
          aria-label="Search Auremont"
          className="h-13 pl-10 pr-11 text-lg"
        />
        {raw && (
          <button
            onClick={() => {
              setRaw("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="press absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-sm text-ink-400 hover:bg-ink-50 hover:text-ink-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!searching ? (
        <div className="space-y-6">
          {recent.length > 0 && (
            <section>
              <div className="mb-2 flex items-baseline justify-between px-1">
                <h2 className="text-[13px] font-semibold uppercase tracking-[0.09em] text-ink-400">
                  Recent
                </h2>
                <button
                  onClick={() => {
                    setRecent([]);
                    try {
                      localStorage.removeItem(RECENT_KEY);
                    } catch {
                      /* ignore */
                    }
                  }}
                  className="text-sm font-semibold text-ink-500 hover:text-ink-900"
                >
                  Clear
                </button>
              </div>
              <Surface className="divide-y divide-line overflow-hidden">
                {recent.map((term) => (
                  <button
                    key={term}
                    onClick={() => setRaw(term)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-ink-25"
                  >
                    <Clock className="h-4 w-4 shrink-0 text-ink-400" />
                    <span className="truncate text-base text-ink-800">{term}</span>
                  </button>
                ))}
              </Surface>
            </section>
          )}

          <section>
            <h2 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-[0.09em] text-ink-400">
              Try searching for
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setRaw(s)}
                  className="press rounded-sm border border-line-strong bg-surface px-3 py-2 text-sm font-semibold text-ink-600 hover:border-ink-300 hover:text-ink-900"
                >
                  {s}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : hits.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title={`No results for "${query}"`}
          body="Check the spelling, or try a merchant name, an account or a help topic."
        />
      ) : (
        <div className="space-y-5">
          {grouped.map((section) => (
            <section key={section.group}>
              <div className="mb-2 flex items-baseline justify-between px-1">
                <h2 className="text-[13px] font-semibold uppercase tracking-[0.09em] text-ink-400">
                  {section.group}
                </h2>
                <span className="tnum text-xs text-ink-400">{section.items.length}</span>
              </div>
              <Surface className="divide-y divide-line overflow-hidden">
                {section.items.map((hit) => {
                  const index = flat.indexOf(hit);
                  return (
                    <Link
                      key={`${hit.group}-${hit.href}-${hit.title}-${index}`}
                      href={hit.href}
                      onClick={() => remember(query)}
                      onMouseEnter={() => setCursor(index)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 transition-colors",
                        cursor === index ? "bg-ink-25" : "hover:bg-ink-25"
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-base font-medium text-ink-900">
                          {hit.title}
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-ink-400">
                          {hit.detail}
                        </span>
                      </span>
                      {hit.amount !== undefined && (
                        <Money value={hit.amount} className="shrink-0 text-base font-semibold" />
                      )}
                    </Link>
                  );
                })}
              </Surface>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
