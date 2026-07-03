import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/common/EmptyState";
import { TransactionRow } from "@/components/transactions/TransactionRow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { currentMonthKey, monthKey, monthLabel } from "@/lib/finance";
import { cn } from "@/lib/utils";
import type { TxType } from "@/lib/types";
import { useTransactionDialog } from "@/components/transactions/TransactionDialog";
import { Plus, Search } from "lucide-react";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — Shaheem Finance" },
      { name: "description", content: "Search, filter and manage all your recorded transactions." },
    ],
  }),
  component: TransactionsPage,
});

const TYPE_FILTERS: { value: "all" | TxType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "transfer", label: "Transfer" },
];

function TransactionsPage() {
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);
  const openDialog = useTransactionDialog((s) => s.open);
  const [q, setQ] = useState("");
  const [month, setMonth] = useState<string>(currentMonthKey());
  const [type, setType] = useState<"all" | TxType>("all");

  const months = useMemo(() => {
    const set = new Set<string>([currentMonthKey()]);
    transactions.forEach((t) => set.add(monthKey(t.date)));
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (month !== "all" && monthKey(t.date) !== month) return false;
      if (type !== "all" && t.type !== type) return false;
      if (q) {
        const cat = categories.find((c) => c.id === t.categoryId)?.name ?? "";
        const hay = `${cat} ${t.notes ?? ""} ${t.amount}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [transactions, categories, q, month, type]);

  return (
    <AppShell title="Transactions">
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search notes, category, amount"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-full border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="all">All months</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
          <div className="flex gap-1 rounded-full bg-muted p-1">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setType(f.value)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  type === f.value ? "bg-card shadow-sm" : "text-muted-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        {filtered.length === 0 ? (
          <EmptyState
            title="No transactions"
            description="Try changing filters or add a new transaction."
            action={
              <Button onClick={() => openDialog()}>
                <Plus className="mr-1.5 h-4 w-4" /> Add transaction
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
