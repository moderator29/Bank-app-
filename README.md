# Auremont Bank

A premium US digital banking experience — accounts, cards, payments and
insights in one considered product, built with Next.js 15.

## Stack

- **Next.js 15** (App Router) + **TypeScript** (strict)
- **Tailwind CSS v4** — the whole design system lives in `src/app/globals.css`
- **Zustand** (persist) — one store, everything else derived
- **Framer Motion** — page, sheet and passcode transitions
- **Recharts** — cash flow, category and balance charts
- **lucide-react** — one icon set, one stroke weight

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Design system

`globals.css` holds every token the app is allowed to use: an Auremont Navy
ink scale, a brass accent, surface and line colours, a radius scale (large
containers, sharp controls), three elevation steps, a type scale and motion
easings. Light and dark are both first-class — the ink scale flips under
`[data-theme="dark"]` so text and neutral utilities keep their meaning, and
the theme is applied before paint to avoid a flash.

Containers share two treatments: a lit hairline **edge** traced around the
border, and selective **glass** for the floating navigation, sticky headers
and sheets. Glass is never used where figures need to stay legible.

## Architecture

```
src/
  app/
    (auth)/signin, passcode       # email + password, then a 6-digit passcode
    (app)/…                       # the authenticated shell
  components/
    brand/                        # the Auremont seal and wordmark
    ui/                           # surface, button, input, sheet, list, money…
    nav/                          # tab bar, sidebar, top bar
    home/ accounts/ cards/        # feature surfaces
    activity/ insights/
  lib/
    types.ts                      # the domain model
    seed.ts                       # account fixtures
    store.ts                      # the single persisted store
    selectors.ts                  # every derived figure
    hooks.ts                      # memoised derivations for components
```

### State

One Zustand store holds accounts, transactions, cards, recipients, bills,
scheduled payments, linked banks, statements, devices, sign-in activity,
support threads and preferences, persisted to `localStorage`. Nothing derived
is ever stored: balances, month summaries, category spend, cash flow,
subscriptions and search results are all computed from the same ledger
through `selectors.ts`, so no two screens can disagree.

Components read derived values through `lib/hooks.ts` rather than building
them inside a selector — returning a fresh array from a Zustand selector
re-renders forever.

### Flows

Transfer, send money, bill pay, check deposit and external transfers all run
through one `MoneyFlow` component: enter → review → processing →
success, with a single shared error path. Sensitive actions (revealing a card
number, changing security settings, removing a device) go through
`PasscodeGate`.

## Routes

Home · Accounts · Account detail · Linked banks · Cards · Card detail · Card
limits · Payments · Transfer · Send · Recipients · Bills · Bill detail ·
Scheduled · Add money · Check deposit · Direct deposit · Activity ·
Transaction detail · Insights · Category detail · Recurring payments ·
Search · Documents · Statement viewer · Notifications · Profile · Personal
information · Settings · Appearance · Notifications · Privacy · Security ·
Passcode · Devices · Sign-in activity · Support · Help topics · Chat
