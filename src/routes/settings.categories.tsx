import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ChevronLeft, Trash2 } from "lucide-react";

export const Route = createFileRoute("/settings/categories")({
  head: () => ({
    meta: [{ title: "Categories — Shaheem Finance" }, { name: "description", content: "Manage income and expense categories." }],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const categories = useAppStore((s) => s.categories);
  const addCategory = useAppStore((s) => s.addCategory);
  const removeCategory = useAppStore((s) => s.removeCategory);

  const [name, setName] = useState("");
  const [kind, setKind] = useState<"income" | "expense">("expense");

  const income = categories.filter((c) => c.kind === "income");
  const expense = categories.filter((c) => c.kind === "expense");

  return (
    <AppShell
      title="Categories"
      action={
        <Link to="/settings" className="flex items-center text-sm text-muted-foreground">
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
      }
    >
      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <p className="text-sm font-medium">New category</p>
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-full bg-muted p-1">
          {(["expense", "income"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={cn(
                "rounded-full py-2 text-sm font-medium capitalize transition-colors",
                kind === k
                  ? k === "income"
                    ? "bg-income text-income-foreground"
                    : "bg-expense text-expense-foreground"
                  : "text-muted-foreground",
              )}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button
            disabled={!name.trim()}
            onClick={() => {
              addCategory({ name: name.trim(), kind });
              setName("");
            }}
          >
            Add
          </Button>
        </div>
      </div>

      <Group title="Income" items={income} onDelete={removeCategory} />
      <Group title="Expense" items={expense} onDelete={removeCategory} />
    </AppShell>
  );
}

function Group({
  title,
  items,
  onDelete,
}: {
  title: string;
  items: { id: string; name: string }[];
  onDelete: (id: string) => void;
}) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 text-sm font-semibold text-muted-foreground">{title}</h2>
      <ul className="space-y-2">
        {items.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3">
            <span className="text-sm font-medium">{c.name}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (confirm(`Delete "${c.name}"?`)) onDelete(c.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
