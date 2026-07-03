import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/common/Money";
import { useAppStore } from "@/lib/store";
import { budgetFor, currentMonthKey, monthTotals } from "@/lib/finance";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/budget")({
  head: () => ({
    meta: [
      { title: "Budget — Shaheem Finance" },
      { name: "description", content: "Set your monthly budget and track spending progress." },
    ],
  }),
  component: BudgetPage,
});

function BudgetPage() {
  const transactions = useAppStore((s) => s.transactions);
  const budgets = useAppStore((s) => s.budgets);
  const setBudget = useAppStore((s) => s.setBudget);

  const month = currentMonthKey();
  const budget = budgetFor(budgets, month);
  const { expense } = monthTotals(transactions, month);
  const remaining = budget - expense;
  const pct = budget > 0 ? Math.min(100, (expense / budget) * 100) : 0;
  const over = budget > 0 && expense > budget;

  const [input, setInput] = useState(budget ? String(budget) : "");

  return (
    <AppShell title="Budget">
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <p className="text-xs font-medium text-muted-foreground">This month's budget</p>
        <Money value={budget} className="mt-1 block text-3xl font-semibold" />

        <div className="mt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Spent</span>
            <Money value={expense} className="font-medium text-expense" />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Remaining</span>
            <Money value={remaining} className={`font-medium ${remaining < 0 ? "text-expense" : "text-income"}`} />
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className={over ? "h-full bg-expense" : "h-full bg-primary"}
              style={{ width: `${pct}%` }}
            />
          </div>
          {over && (
            <div className="flex items-start gap-2 rounded-xl bg-expense-soft p-3 text-sm text-expense">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>You've exceeded this month's budget.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border/60 bg-card p-5">
        <p className="text-sm font-medium">Set monthly budget</p>
        <div className="mt-3 flex gap-2">
          <Input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={() => setBudget(month, Number(input) || 0)}>Save</Button>
        </div>
      </div>
    </AppShell>
  );
}
