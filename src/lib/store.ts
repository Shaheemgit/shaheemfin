import { create } from "zustand";
import type { Account, Budget, Category, Settings, Transaction } from "./types";
import { uid } from "./storage/db";
import {
  accountsRepo,
  budgetsRepo,
  categoriesRepo,
  settingsRepo,
  transactionsRepo,
} from "./storage/repos";
import { seedIfEmpty } from "./storage/seed";
import { STORAGE_KEYS, SCHEMA_VERSION } from "./storage/keys";

interface State {
  hydrated: boolean;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  settings: Settings;

  hydrate: () => void;

  addAccount: (a: Omit<Account, "id" | "createdAt">) => void;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  removeAccount: (id: string) => void;

  addCategory: (c: Omit<Category, "id">) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  removeCategory: (id: string) => void;

  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;

  setBudget: (month: string, amount: number) => void;

  setSettings: (patch: Partial<Settings>) => void;

  resetAll: () => void;
  importAll: (data: {
    accounts?: Account[];
    categories?: Category[];
    transactions?: Transaction[];
    budgets?: Budget[];
  }) => void;
}

export const useAppStore = create<State>((set, get) => ({
  hydrated: false,
  accounts: [],
  categories: [],
  transactions: [],
  budgets: [],
  settings: { currency: "INR", theme: "system", schemaVersion: SCHEMA_VERSION },

  hydrate: () => {
    if (typeof window === "undefined") return;
    seedIfEmpty();
    set({
      accounts: accountsRepo.list(),
      categories: categoriesRepo.list(),
      transactions: transactionsRepo.list(),
      budgets: budgetsRepo.list(),
      settings: settingsRepo.get(),
      hydrated: true,
    });
  },

  addAccount: (a) => {
    const row: Account = { ...a, id: uid(), createdAt: new Date().toISOString() };
    const next = [...get().accounts, row];
    accountsRepo.save(next);
    set({ accounts: next });
  },
  updateAccount: (id, patch) => {
    const next = get().accounts.map((a) => (a.id === id ? { ...a, ...patch } : a));
    accountsRepo.save(next);
    set({ accounts: next });
  },
  removeAccount: (id) => {
    const next = get().accounts.filter((a) => a.id !== id);
    accountsRepo.save(next);
    set({ accounts: next });
  },

  addCategory: (c) => {
    const row: Category = { ...c, id: uid() };
    const next = [...get().categories, row];
    categoriesRepo.save(next);
    set({ categories: next });
  },
  updateCategory: (id, patch) => {
    const next = get().categories.map((c) => (c.id === id ? { ...c, ...patch } : c));
    categoriesRepo.save(next);
    set({ categories: next });
  },
  removeCategory: (id) => {
    const next = get().categories.filter((c) => c.id !== id);
    categoriesRepo.save(next);
    set({ categories: next });
  },

  addTransaction: (t) => {
    const row: Transaction = { ...t, id: uid(), createdAt: new Date().toISOString() };
    const next = [row, ...get().transactions];
    transactionsRepo.save(next);
    set({ transactions: next });
  },
  updateTransaction: (id, patch) => {
    const next = get().transactions.map((t) => (t.id === id ? { ...t, ...patch } : t));
    transactionsRepo.save(next);
    set({ transactions: next });
  },
  removeTransaction: (id) => {
    const next = get().transactions.filter((t) => t.id !== id);
    transactionsRepo.save(next);
    set({ transactions: next });
  },

  setBudget: (month, amount) => {
    const rest = get().budgets.filter((b) => b.month !== month);
    const next = [...rest, { month, amount }];
    budgetsRepo.save(next);
    set({ budgets: next });
  },

  setSettings: (patch) => {
    const next = { ...get().settings, ...patch };
    settingsRepo.save(next);
    set({ settings: next });
  },

  resetAll: () => {
    if (typeof window !== "undefined") {
      Object.values(STORAGE_KEYS).forEach((k) => window.localStorage.removeItem(k));
    }
    seedIfEmpty();
    set({
      accounts: accountsRepo.list(),
      categories: categoriesRepo.list(),
      transactions: transactionsRepo.list(),
      budgets: budgetsRepo.list(),
      settings: settingsRepo.get(),
    });
  },

  importAll: (data) => {
    const s = get();
    const accounts = data.accounts ?? s.accounts;
    const categories = data.categories ?? s.categories;
    const transactions = data.transactions ?? s.transactions;
    const budgets = data.budgets ?? s.budgets;
    accountsRepo.save(accounts);
    categoriesRepo.save(categories);
    transactionsRepo.save(transactions);
    budgetsRepo.save(budgets);
    set({ accounts, categories, transactions, budgets });
  },
}));
