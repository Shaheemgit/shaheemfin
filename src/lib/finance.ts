import type { Account, Budget, Transaction } from "./types";

export function monthKey(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function currentMonthKey(): string {
  return monthKey(new Date());
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function accountBalance(account: Account, transactions: Transaction[]): number {
  let bal = account.openingBalance;
  for (const t of transactions) {
    if (t.type === "income" && t.accountId === account.id) bal += t.amount;
    else if (t.type === "expense" && t.accountId === account.id) bal -= t.amount;
    else if (t.type === "transfer") {
      if (t.accountId === account.id) bal -= t.amount;
      if (t.toAccountId === account.id) bal += t.amount;
    }
  }
  return bal;
}

export function totalBalance(accounts: Account[], transactions: Transaction[]): number {
  return accounts.reduce((sum, a) => sum + accountBalance(a, transactions), 0);
}

export function monthTotals(transactions: Transaction[], month: string) {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (monthKey(t.date) !== month) continue;
    if (t.type === "income") income += t.amount;
    else if (t.type === "expense") expense += t.amount;
  }
  return { income, expense, savings: income - expense };
}

export function budgetFor(budgets: Budget[], month: string): number {
  return budgets.find((b) => b.month === month)?.amount ?? 0;
}

export function spendingByCategory(transactions: Transaction[], month: string) {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense" || monthKey(t.date) !== month) continue;
    map.set(t.categoryId ?? "uncat", (map.get(t.categoryId ?? "uncat") ?? 0) + t.amount);
  }
  return map;
}

export function lastNMonths(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(monthKey(d));
  }
  return out;
}

export function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}
