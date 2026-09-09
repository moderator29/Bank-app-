# Ecokripto — Smart Money. Limitless Future.

A premium, glass-morphism **savings dashboard demo** built with Next.js 15.

> **Demo only.** Ecokripto is a UI/UX showcase. There is no backend — accounts,
> balances, transactions, goals and notifications are simulated and stored
> locally in your browser (localStorage). No real money is ever involved.

## Stack

- **Next.js 15** (App Router) + **TypeScript** (strict)
- **Tailwind CSS v4** with custom emerald/glass design tokens
- **Framer Motion** — page transitions, counting balance, floating cards
- **Zustand** (persist) — local demo state
- **Recharts** — growth + allocation charts
- **lucide-react** icons

## Features

- Local signup/login (name, email, password — no verification, instant access)
- Dashboard: animated balance hero, APY + payout chips, quick actions,
  account summary, savings growth chart, recent activity, goal previews
- Pages: Savings, Locked Savings, APY Earnings, Investments, Deposit,
  Withdraw, Transactions, Goals, Rewards, Referrals, Profile, Notifications,
  Support, Settings
- Working demo flows: deposit / withdraw (instant, local), create + fund
  savings goals, create locked plans, claim a reward, notifications read state
- Responsive: glass sidebar on desktop, bottom navigation + slide-in
  "More" drawer on mobile

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000 and create a demo account.

## Structure

```
src/
  app/
    (auth)/login, signup      # local demo auth
    (app)/…                   # all dashboard pages (shared shell)
  components/
    brand/                    # logo
    nav/                      # sidebar, bottom nav, drawer, topbar
    shared/                   # page header, stat card, transaction row, …
    shell/                    # app shell + auth guard
    ui/                       # button, input, modal, glass card, …
  lib/                        # store, types, seed data, utils
```
