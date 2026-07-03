import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { Money } from "@/components/common/Money";
import { useAppStore } from "@/lib/store";
import {
  accountBalance, currentMonthKey, lastNMonths, monthKey,
  monthLabel, monthTotals, spendingByCategory,
} from "@/lib/finance";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Shaheem Finance" },
      { name: "description", content: "Charts and reports for income, expenses, categories and account balances." },
    ],
  }),
  component: ReportsPage,
});

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function ReportsPage() {
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);
  const accounts = useAppStore((s) => s.accounts);

  const months = useMemo(() => {
    const set = new Set<string>([currentMonthKey()]);
    transactions.forEach((t) => set.add(monthKey(t.date)));
    return Array.from(set).sort().reverse();
  }, [transactions]);
  const [month, setMonth] = useState(currentMonthKey());

  const totals = monthTotals(transactions, month);

  const pieData = useMemo(() => {
    const map = spendingByCategory(transactions, month);
    return Array.from(map.entries()).map(([id, value]) => ({
      name: categories.find((c) => c.id === id)?.name ?? "Other",
      value,
    }));
  }, [transactions, categories, month]);

  const barData = useMemo(
    () =>
      lastNMonths(6).map((m) => {
        const t = monthTotals(transactions, m);
        return { month: monthLabel(m), Income: t.income, Expense: t.expense };
      }),
    [transactions],
  );

  const lineData = useMemo(
    () =>
      lastNMonths(6).map((m) => {
        const t = monthTotals(transactions, m);
        return { month: monthLabel(m), Savings: t.income - t.expense };
      }),
    [transactions],
  );

  return (
    <AppShell
      title="Reports"
      action={
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-full border border-input bg-background px-3 py-1.5 text-sm"
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
      }
    >
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Income" tone="text-income"><Money value={totals.income} /></Stat>
        <Stat label="Expense" tone="text-expense"><Money value={totals.expense} /></Stat>
        <Stat label="Savings" tone={totals.savings >= 0 ? "text-income" : "text-expense"}>
          <Money value={totals.savings} />
        </Stat>
      </div>

      <Panel title="Spending by category">
        {pieData.length === 0 ? (
          <Empty />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      <Panel title="Income vs Expense (last 6 months)">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis fontSize={12} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="Income" fill="var(--income)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Expense" fill="var(--expense)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Savings trend">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis fontSize={12} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="Savings" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Account balances">
        <ul className="divide-y divide-border/60">
          {accounts.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-3">
              <span className="text-sm font-medium">{a.name}</span>
              <Money value={accountBalance(a, transactions)} className="font-semibold tabular-nums" />
            </li>
          ))}
        </ul>
      </Panel>
    </AppShell>
  );
}

const tooltipStyle = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" };

function Stat({ label, tone, children }: { label: string; tone: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-3">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${tone}`}>{children}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 rounded-2xl border border-border/60 bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Empty() {
  return <p className="py-8 text-center text-sm text-muted-foreground">No data for this month.</p>;
}
