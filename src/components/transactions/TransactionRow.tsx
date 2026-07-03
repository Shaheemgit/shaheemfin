import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { Transaction } from "@/lib/types";
import { Money } from "@/components/common/Money";
import { useTransactionDialog } from "@/components/transactions/TransactionDialog";

export function TransactionRow({ tx }: { tx: Transaction }) {
  const categories = useAppStore((s) => s.categories);
  const accounts = useAppStore((s) => s.accounts);
  const remove = useAppStore((s) => s.removeTransaction);
  const open = useTransactionDialog((s) => s.open);

  const cat = categories.find((c) => c.id === tx.categoryId);
  const acct = accounts.find((a) => a.id === tx.accountId);
  const toAcct = accounts.find((a) => a.id === tx.toAccountId);

  const meta =
    tx.type === "transfer"
      ? `${acct?.name ?? "—"} → ${toAcct?.name ?? "—"}`
      : `${cat?.name ?? "Uncategorized"} · ${acct?.name ?? "—"}`;

  const Icon = tx.type === "income" ? ArrowDownLeft : tx.type === "expense" ? ArrowUpRight : ArrowRightLeft;
  const tone =
    tx.type === "income"
      ? "bg-income-soft text-income"
      : tx.type === "expense"
        ? "bg-expense-soft text-expense"
        : "bg-transfer-soft text-transfer";
  const sign = tx.type === "income" ? "+" : tx.type === "expense" ? "-" : "";
  const amountColor =
    tx.type === "income" ? "text-income" : tx.type === "expense" ? "text-expense" : "text-transfer";

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-3 py-3 transition-colors hover:bg-accent/40">
      <div className={cn("grid h-10 w-10 place-items-center rounded-full", tone)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {tx.type === "transfer" ? "Transfer" : cat?.name ?? "Uncategorized"}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {meta}
          {tx.notes ? ` · ${tx.notes}` : ""}
        </p>
      </div>
      <div className="text-right">
        <p className={cn("text-sm font-semibold tabular-nums", amountColor)}>
          {sign}
          <Money value={tx.amount} />
        </p>
        <p className="text-[11px] text-muted-foreground">
          {new Date(tx.date).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => open(tx)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => {
              if (confirm("Delete this transaction?")) remove(tx.id);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
