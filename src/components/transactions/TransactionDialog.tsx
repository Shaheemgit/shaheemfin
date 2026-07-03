import { create } from "zustand";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { Transaction, TxType } from "@/lib/types";

interface DialogState {
  isOpen: boolean;
  editing?: Transaction;
  open: (editing?: Transaction) => void;
  close: () => void;
}

export const useTransactionDialog = create<DialogState>((set) => ({
  isOpen: false,
  editing: undefined,
  open: (editing) => set({ isOpen: true, editing }),
  close: () => set({ isOpen: false, editing: undefined }),
}));

const TYPES: { value: TxType; label: string; tone: string }[] = [
  { value: "expense", label: "Expense", tone: "data-[on=true]:bg-expense data-[on=true]:text-expense-foreground" },
  { value: "income", label: "Income", tone: "data-[on=true]:bg-income data-[on=true]:text-income-foreground" },
  { value: "transfer", label: "Transfer", tone: "data-[on=true]:bg-transfer data-[on=true]:text-transfer-foreground" },
];

function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}

export function TransactionDialog() {
  const { isOpen, editing, close } = useTransactionDialog();
  const accounts = useAppStore((s) => s.accounts);
  const categories = useAppStore((s) => s.categories);
  const add = useAppStore((s) => s.addTransaction);
  const update = useAppStore((s) => s.updateTransaction);

  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [toAccountId, setToAccountId] = useState<string>("");
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setType(editing.type);
      setAmount(String(editing.amount));
      setCategoryId(editing.categoryId ?? "");
      setAccountId(editing.accountId);
      setToAccountId(editing.toAccountId ?? "");
      setDate(editing.date.slice(0, 10));
      setNotes(editing.notes ?? "");
    } else {
      setType("expense");
      setAmount("");
      setCategoryId("");
      setAccountId(accounts[0]?.id ?? "");
      setToAccountId("");
      setDate(todayISO());
      setNotes("");
    }
  }, [isOpen, editing, accounts]);

  const filteredCategories = useMemo(
    () => categories.filter((c) => (type === "transfer" ? false : c.kind === type)),
    [categories, type],
  );

  const canSave =
    Number(amount) > 0 &&
    accountId &&
    (type === "transfer" ? toAccountId && toAccountId !== accountId : !!categoryId);

  function save() {
    if (!canSave) return;
    const payload = {
      type,
      amount: Number(amount),
      accountId,
      toAccountId: type === "transfer" ? toAccountId : undefined,
      categoryId: type === "transfer" ? undefined : categoryId,
      date: new Date(date).toISOString(),
      notes: notes.trim() || undefined,
    };
    if (editing) update(editing.id, payload);
    else add(payload);
    close();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit transaction" : "Add transaction"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 rounded-full bg-muted p-1">
            {TYPES.map((t) => (
              <button
                key={t.value}
                data-on={type === t.value}
                onClick={() => setType(t.value)}
                className={cn(
                  "rounded-full py-2 text-sm font-medium text-muted-foreground transition-all",
                  t.tone,
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              inputMode="decimal"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 text-2xl h-14"
            />
          </div>

          {type !== "transfer" && (
            <div>
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>{type === "transfer" ? "From account" : "Account"}</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === "transfer" && (
            <div>
              <Label>To account</Label>
              <Select value={toAccountId} onValueChange={setToAccountId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts
                    .filter((a) => a.id !== accountId)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
              className="mt-1.5"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={close}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={save} disabled={!canSave}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
