import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/store";
import { downloadCSV, exportCSV, parseCSV } from "@/lib/storage/csv";
import { toast } from "sonner";
import { ChevronRight, Download, Upload, RotateCcw, Wallet, Tags } from "lucide-react";

export const Route = createFileRoute("/settings/")({
  head: () => ({
    meta: [
      { title: "Settings — Shaheem Finance" },
      { name: "description", content: "Preferences, accounts, categories, data import and export." },
    ],
  }),
  component: SettingsPage,
});

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SAR", "JPY", "AUD", "CAD"];

function SettingsPage() {
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const importAll = useAppStore((s) => s.importAll);
  const resetAll = useAppStore((s) => s.resetAll);
  const accounts = useAppStore((s) => s.accounts);
  const categories = useAppStore((s) => s.categories);
  const transactions = useAppStore((s) => s.transactions);
  const budgets = useAppStore((s) => s.budgets);
  const fileRef = useRef<HTMLInputElement>(null);

  function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = parseCSV(String(reader.result));
        importAll(data);
        toast.success("Data imported");
      } catch {
        toast.error("Failed to import CSV");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <AppShell title="Settings">
      <section className="rounded-2xl border border-border/60 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Preferences</h2>
        <div className="space-y-4">
          <div>
            <Label>Currency</Label>
            <Select
              value={settings.currency}
              onValueChange={(v) => setSettings({ currency: v })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Dark mode</Label>
              <p className="text-xs text-muted-foreground">Follows system when off.</p>
            </div>
            <Switch
              checked={settings.theme === "dark"}
              onCheckedChange={(v) => setSettings({ theme: v ? "dark" : "system" })}
            />
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-border/60 bg-card">
        <SettingsLink to="/settings/accounts" icon={<Wallet className="h-4 w-4" />} label="Accounts" />
        <SettingsLink to="/settings/categories" icon={<Tags className="h-4 w-4" />} label="Categories" />
      </section>

      <section className="mt-4 rounded-2xl border border-border/60 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Data</h2>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => {
              downloadCSV(`shaheem-finance-${Date.now()}.csv`, exportCSV({ accounts, categories, transactions, budgets }));
              toast.success("Exported");
            }}
          >
            <Download className="mr-1.5 h-4 w-4" /> Export
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="mr-1.5 h-4 w-4" /> Import
          </Button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onImport} />
          <Button
            variant="outline"
            className="col-span-2 text-destructive hover:text-destructive"
            onClick={() => {
              if (!confirm("Reset ALL data? This can't be undone.")) return;
              if (!confirm("Really reset everything?")) return;
              resetAll();
              toast.success("All data reset");
            }}
          >
            <RotateCcw className="mr-1.5 h-4 w-4" /> Reset all data
          </Button>
        </div>
      </section>

      <p className="mt-6 text-center text-xs text-muted-foreground">Shaheem Finance · v1.0.0</p>
    </AppShell>
  );
}

function SettingsLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between border-b border-border/60 px-4 py-3 last:border-b-0 hover:bg-accent/40"
    >
      <span className="flex items-center gap-3 text-sm font-medium">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-muted text-muted-foreground">{icon}</span>
        {label}
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
