import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/common/EmptyState";
import { Money } from "@/components/common/Money";
import { TransactionRow } from "@/components/transactions/TransactionRow";
import { useAppStore } from "@/lib/store";
import {
  budgetFor,
  currentMonthKey,
  lastNMonths,
  monthLabel,
  monthTotals,
  spendingByCategory,
  totalBalance,
} from "@/lib/finance";
import { Plus } from "lucide-react";
import { useTransactionDialog } from "@/components/transactions/TransactionDialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Shaheem Finance" },
      { name: "description", content: "Overview of balance, income, expenses and monthly savings." },
    ],
  }),
  component: Dashboard,
});

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Dashboard() {
  const accounts = useAppStore((s) => s.accounts);
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);
  const budgets = useAppStore((s) => s.budgets);
  const openDialog = useTransactionDialog((s) => s.open);

  const month = currentMonthKey();
  const balance = totalBalance(accounts, transactions);
  const { income, expense, savings } = monthTotals(transactions, month);
  const budget = budgetFor(budgets, month);
  const recent = transactions.slice(0, 10);

  const pieData = useMemo(() => {
    const map = spendingByCategory(transactions, month);
    return Array.from(map.entries())
      .map(([id, value]) => ({
        name: categories.find((c) => c.id === id)?.name ?? "Other",
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories, month]);

  const barData = useMemo(() => {
    return lastNMonths(6).map((m) => {
      const t = monthTotals(transactions, m);
      return { month: monthLabel(m), Income: t.income, Expense: t.expense };
    });
  }, [transactions]);

  return (
    <AppShell title="Dashboard">
      <section className="relative overflow-hidden rounded-3xl bg-primary-deep p-6 text-primary-deep-foreground shadow-xl shadow-primary/10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-deep-foreground/60">
          Total balance
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <Money value={balance} className="font-display text-3xl font-semibold tracking-tight tabular-nums" />
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <p className="text-xs text-primary-deep-foreground/70">
            {accounts.length} {accounts.length === 1 ? "account" : "accounts"}
          </p>
          <button
            onClick={() => openDialog()}
            className="rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-primary-deep shadow-sm transition-colors hover:bg-white/90"
          >
            Add transaction
          </button>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-3 gap-3">
        <StatTile label="Income" value={income} tone="income" />
        <StatTile label="Expenses" value={expense} tone="expense" />
        <StatTile label="Savings" value={savings} tone={savings >= 0 ? "income" : "expense"} />
      </section>

      {budget > 0 && (
        <Link
          to="/budget"
          className="mt-4 block rounded-2xl border border-border/60 bg-card p-4"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Monthly budget</span>
            <span className="text-muted-foreground tabular-nums">
              <Money value={expense} /> / <Money value={budget} />
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={expense > budget ? "h-full bg-expense" : "h-full bg-primary"}
              style={{ width: `${Math.min(100, (expense / budget) * 100)}%` }}
            />
          </div>
        </Link>
      )}

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Recent activity
          </h2>
          <Link to="/transactions" className="text-xs font-semibold text-primary">See all</Link>
        </div>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/70 bg-muted/40 p-8 text-center">
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-card shadow-sm">
              <Plus className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold">No transactions yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your activity will appear here once you record a transaction.
            </p>
            <Button onClick={() => openDialog()} className="mt-4">
              <Plus className="mr-1.5 h-4 w-4" /> Add transaction
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </section>

      {pieData.length > 0 && (
        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-4">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Spending by category
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-border/60 bg-card p-4">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Income vs expense
        </h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="Income" fill="var(--income)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Expense" fill="var(--expense)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </AppShell>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "income" | "expense";
}) {
  const toneClass =
    tone === "income"
      ? "bg-income-soft text-income"
      : "bg-expense-soft text-expense";
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${toneClass}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <Money value={value} className="mt-0.5 block text-sm font-semibold tabular-nums" />
    </div>
  );
}
