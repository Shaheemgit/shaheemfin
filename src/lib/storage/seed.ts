import type { Account, Category } from "../types";
import { uid, readJSON, writeJSON } from "./db";
import { STORAGE_KEYS } from "./keys";
import { accountsRepo, categoriesRepo } from "./repos";

const DEFAULT_ACCOUNTS: Omit<Account, "id" | "createdAt">[] = [
  { name: "Cash", openingBalance: 0 },
  { name: "Bank", openingBalance: 0 },
  { name: "Wallet", openingBalance: 0 },
];

const DEFAULT_INCOME = ["Salary", "Business", "Gift", "Interest", "Other"];
const DEFAULT_EXPENSE = [
  "Food",
  "Fuel",
  "Shopping",
  "Medical",
  "Education",
  "Travel",
  "Rent",
  "Bills",
  "Entertainment",
  "Other",
];

export function seedIfEmpty() {
  if (typeof window === "undefined") return;
  const seeded = readJSON<boolean>(STORAGE_KEYS.seeded, false);
  if (seeded) return;

  if (accountsRepo.list().length === 0) {
    const now = new Date().toISOString();
    accountsRepo.save(
      DEFAULT_ACCOUNTS.map((a) => ({ ...a, id: uid(), createdAt: now })),
    );
  }
  if (categoriesRepo.list().length === 0) {
    const cats: Category[] = [
      ...DEFAULT_INCOME.map((name) => ({ id: uid(), name, kind: "income" as const })),
      ...DEFAULT_EXPENSE.map((name) => ({ id: uid(), name, kind: "expense" as const })),
    ];
    categoriesRepo.save(cats);
  }
  writeJSON(STORAGE_KEYS.seeded, true);
}
