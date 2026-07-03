import Papa from "papaparse";
import type { Account, Budget, Category, Transaction } from "../types";

interface Snapshot {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
}

export function exportCSV(data: Snapshot): string {
  const sections: string[] = [];
  sections.push("# accounts");
  sections.push(Papa.unparse(data.accounts));
  sections.push("");
  sections.push("# categories");
  sections.push(Papa.unparse(data.categories));
  sections.push("");
  sections.push("# transactions");
  sections.push(Papa.unparse(data.transactions));
  sections.push("");
  sections.push("# budgets");
  sections.push(Papa.unparse(data.budgets));
  return sections.join("\n");
}

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCSV(text: string): Partial<Snapshot> {
  const parts = text.split(/^# (\w+)\s*$/m);
  const out: Partial<Snapshot> = {};
  for (let i = 1; i < parts.length; i += 2) {
    const name = parts[i].trim();
    const body = parts[i + 1]?.trim() ?? "";
    if (!body) continue;
    const parsed = Papa.parse(body, { header: true, dynamicTyping: true, skipEmptyLines: true });
    const rows = parsed.data as any[];
    if (name === "accounts") out.accounts = rows as Account[];
    else if (name === "categories") out.categories = rows as Category[];
    else if (name === "transactions") out.transactions = rows as Transaction[];
    else if (name === "budgets") out.budgets = rows as Budget[];
  }
  return out;
}
