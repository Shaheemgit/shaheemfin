import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Money } from "@/components/common/Money";
import { useAppStore } from "@/lib/store";
import { accountBalance } from "@/lib/finance";
import { ChevronLeft, Trash2 } from "lucide-react";

export const Route = createFileRoute("/settings/accounts")({
  head: () => ({
    meta: [{ title: "Accounts — Shaheem Finance" }, { name: "description", content: "Manage your accounts." }],
  }),
  component: AccountsPage,
});

function AccountsPage() {
  const accounts = useAppStore((s) => s.accounts);
  const transactions = useAppStore((s) => s.transactions);
  const addAccount = useAppStore((s) => s.addAccount);
  const removeAccount = useAppStore((s) => s.removeAccount);

  const [name, setName] = useState("");
  const [opening, setOpening] = useState("");

  return (
    <AppShell
      title="Accounts"
      action={
        <Link to="/settings" className="flex items-center text-sm text-muted-foreground">
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
      }
    >
      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <p className="text-sm font-medium">New account</p>
        <div className="mt-3 space-y-2">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            type="number"
            placeholder="Opening balance"
            value={opening}
            onChange={(e) => setOpening(e.target.value)}
          />
          <Button
            className="w-full"
            disabled={!name.trim()}
            onClick={() => {
              addAccount({ name: name.trim(), openingBalance: Number(opening) || 0 });
              setName("");
              setOpening("");
            }}
          >
            Add account
          </Button>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {accounts.map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3"
          >
            <div>
              <p className="font-medium">{a.name}</p>
              <p className="text-xs text-muted-foreground">
                Opening <Money value={a.openingBalance} />
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Money value={accountBalance(a, transactions)} className="font-semibold tabular-nums" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm(`Delete "${a.name}"? Existing transactions will remain but lose their account.`)) {
                    removeAccount(a.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
