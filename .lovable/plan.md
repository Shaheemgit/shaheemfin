
# Shaheem Finance — Build Plan

A single-user, offline-first personal finance app. No auth, no backend. All data in browser localStorage. Modern Material 3–inspired minimal UI with light/dark mode.

## Scope (MVP)

- 5 sections: Dashboard, Transactions, Budget, Reports, Settings
- Accounts + Categories management (accessed from Settings)
- Floating "+" to add a transaction from anywhere
- Charts: pie (category), bar (income vs expense), line (trend)
- CSV import/export, reset data, currency selector, dark mode toggle
- Default currency ₹ INR

## Routes (TanStack Start, file-based)

```
src/routes/
  __root.tsx              # shell + bottom nav + FAB + providers
  index.tsx               # Dashboard
  transactions.tsx        # list + search + filters
  budget.tsx              # monthly budget + progress
  reports.tsx             # charts + month filter
  settings.tsx            # settings hub
  settings.accounts.tsx   # manage accounts
  settings.categories.tsx # manage categories
```

Each route gets its own `head()` with distinct title + description.

The Add Transaction screen opens as a modal Dialog (works over any route, matches one-hand mobile flow) triggered by the FAB or an "Edit" action.

## Design System

- Update `src/styles.css` tokens: light + dark palettes tuned for finance (calm neutrals, high contrast).
- Semantic accents in `@theme inline`:
  - `--color-income` (green), `--color-expense` (red), `--color-transfer` (blue)
  - matching `-foreground` variants
- Rounded-2xl cards, soft shadows, generous spacing, Inter or system-ui typography.
- Smooth transitions via `tw-animate-css` (already installed) + subtle `transition-all` on cards/buttons.
- Bottom nav: fixed, safe-area aware, 5 icons + labels, active state uses primary color.
- FAB: fixed bottom-right above nav, gradient/primary, opens Add Transaction dialog.
- Empty states: simple SVG illustrations + short copy + primary CTA.

## Data Layer (localStorage)

`src/lib/storage/` — a thin repository layer so it can later swap to Cloud/Supabase without refactoring UI.

```
src/lib/storage/
  keys.ts              # storage key constants + schema version
  db.ts                # generic get/set + JSON safety + migration hook
  accounts.repo.ts
  categories.repo.ts
  transactions.repo.ts
  budgets.repo.ts
  settings.repo.ts
  seed.ts              # first-run defaults (accounts, categories, currency)
  csv.ts               # import/export helpers
```

Each repo exposes `list / get / create / update / remove` returning plain objects. UI never touches localStorage directly.

State: a lightweight Zustand store per domain (or React Query with a localStorage query fn) — I'll use **Zustand** (simple, sync, no network) with selectors, plus a `useHydrated` guard for SSR safety (localStorage is client-only, so all reads happen in effects / after mount).

## Models

```ts
type ID = string; // crypto.randomUUID()

type Account = { id: ID; name: string; openingBalance: number; createdAt: string };
type Category = { id: ID; name: string; kind: 'income' | 'expense'; icon?: string; color?: string };
type Transaction = {
  id: ID;
  date: string;              // ISO
  type: 'income' | 'expense' | 'transfer';
  amount: number;            // always positive
  categoryId?: ID;           // required for income/expense
  accountId: ID;             // source
  toAccountId?: ID;          // required for transfer
  notes?: string;
  createdAt: string;
};
type Budget = { id: ID; month: string /* YYYY-MM */; amount: number };
type Settings = { currency: string; theme: 'light' | 'dark' | 'system'; schemaVersion: number };
```

Derived values (balances, monthly totals, budget usage) computed with memoized selectors — never stored.

## Components

```
src/components/
  layout/BottomNav.tsx
  layout/Fab.tsx
  layout/AppShell.tsx
  transactions/TransactionDialog.tsx   # add + edit
  transactions/TransactionList.tsx
  transactions/TransactionFilters.tsx
  dashboard/SummaryCards.tsx
  dashboard/RecentTransactions.tsx
  charts/CategoryPie.tsx
  charts/IncomeExpenseBar.tsx
  charts/TrendLine.tsx
  budget/BudgetProgress.tsx
  common/EmptyState.tsx
  common/ConfirmDialog.tsx
  common/CurrencyText.tsx
  settings/*
```

Charts: use **Recharts** (already common in Lovable stack) — pie, bar, line all supported.

## Feature Details

**Dashboard**: 4 summary cards → recent 10 tx → pie (this month by category) → bar (income vs expense last 6 months) → current budget progress card with link to /budget.

**Transactions**: search box (notes + amount + category name), month picker, category multi-select, type chips (all/income/expense/transfer). Swipe or trailing menu for Edit/Delete. Delete confirms via ConfirmDialog.

**Budget**: single monthly budget for current month. Shows amount, spent, remaining, progress bar (turns destructive when >100%). "Set budget" input.

**Reports**: month picker + all three charts + account balances table.

**Settings**: currency `<Select>` (INR, USD, EUR, GBP, AED, SAR, +more), theme toggle (writes/removes `dark` class on `<html>`), Export CSV (downloads file), Import CSV (file input → parse → merge), Reset (double confirm), links to Accounts + Categories management, app version.

**Add Transaction dialog**: type toggle (income/expense/transfer), amount (numeric keypad `inputMode="decimal"`), category select (filtered by type, hidden for transfer), account select, to-account (only if transfer), date (defaults today), notes. Save + Cancel.

## Dark Mode

Add a small ThemeProvider that reads `settings.theme`, applies `dark` class to `document.documentElement`, and syncs with `prefers-color-scheme` when set to `system`.

## Non-Goals (explicit, per brief)

No cloud sync, no auth, no recurring tx, no reminders, no receipts, no AI, no multi-device — but the storage repo boundary keeps the door open.

## Technical Section

- **Framework**: TanStack Start (already set up). File-based routes as listed.
- **State**: Zustand stores hydrated from localStorage on client mount. All persistence in `src/lib/storage/*` — pure functions, easy to swap for Supabase later by replacing repo implementations.
- **SSR safety**: routes render skeleton until Zustand hydration effect runs (localStorage is undefined on server). No loaders touch storage.
- **Charts**: `recharts` (install via `bun add recharts`).
- **CSV**: `papaparse` (install via `bun add papaparse`).
- **Icons**: `lucide-react` (already available).
- **IDs**: `crypto.randomUUID()`.
- **Money**: numbers stored as decimals; format with `Intl.NumberFormat(locale, { style:'currency', currency })`.
- **Schema migration**: `settings.schemaVersion` + a migration switch in `db.ts` for future changes.
- **No new colors as raw hex in components** — extend `src/styles.css` with `--income`, `--expense`, `--transfer` tokens mapped in `@theme inline`.

## Deliverable Order

1. Design tokens + AppShell + BottomNav + FAB in `__root.tsx`
2. Storage repos + seed + Zustand stores
3. Add Transaction dialog
4. Dashboard
5. Transactions list + filters + edit/delete
6. Budget
7. Reports (charts)
8. Settings + Accounts + Categories + CSV + Reset + Theme
9. Empty states polish + head() metadata per route
