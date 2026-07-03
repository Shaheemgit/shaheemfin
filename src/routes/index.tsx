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
      <section className="grid grid-cols-2 gap-3">
        <SummaryCard label="Balance" className="col-span-2 bg-primary text-primary-foreground">
          <Money value={balance} className="text-3xl font-semibold tracking-tight" />
          <p className="mt-1 text-xs opacity-80">{accounts.length} accounts</p>
        </SummaryCard>
        <SummaryCard label="Income" className="bg-income-soft">
          <Money value={income} className="text-lg font-semibold text-income" />
        </SummaryCard>
        <SummaryCard label="Expenses" className="bg-expense-soft">
          <Money value={expense} className="text-lg font-semibold text-expense" />
        </SummaryCard>
        <SummaryCard label="Savings" className="col-span-2">
          <Money
            value={savings}
            className={`text-lg font-semibold ${savings >= 0 ? "text-income" : "text-expense"}`}
          />
        </SummaryCard>
      </section>

      {budget > 0 && (
        <Link
          to="/budget"
          className="mt-4 block rounded-2xl border border-border/60 bg-card p-4"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Monthly budget</span>
            <span className="text-muted-foreground">
              <Money value={expense} /> / <Money value={budget} />
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={expense > budget ? "h-full bg-expense" : "h-full bg-primary"}
              style={{ width: `${Math.min(100, (expense / budget) * 100)}%` }}
            />
          </div>
        </Link>
      )}

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Recent transactions</h2>
          <Link to="/transactions" className="text-xs text-primary">See all</Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Tap the + button to record your first one."
            action={
              <Button onClick={() => openDialog()}>
                <Plus className="mr-1.5 h-4 w-4" /> Add transaction
              </Button>
            }
          />
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
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Spending by category</h2>
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
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Income vs Expense</h2>
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

function SummaryCard({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-border/60 bg-card p-4 ${className ?? ""}`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
