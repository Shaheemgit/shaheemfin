import type { Account, Budget, Category, Settings, Transaction } from "../types";
import { readJSON, writeJSON } from "./db";
import { SCHEMA_VERSION, STORAGE_KEYS } from "./keys";

export const accountsRepo = {
  list: () => readJSON<Account[]>(STORAGE_KEYS.accounts, []),
  save: (rows: Account[]) => writeJSON(STORAGE_KEYS.accounts, rows),
};

export const categoriesRepo = {
  list: () => readJSON<Category[]>(STORAGE_KEYS.categories, []),
  save: (rows: Category[]) => writeJSON(STORAGE_KEYS.categories, rows),
};

export const transactionsRepo = {
  list: () => readJSON<Transaction[]>(STORAGE_KEYS.transactions, []),
  save: (rows: Transaction[]) => writeJSON(STORAGE_KEYS.transactions, rows),
};

export const budgetsRepo = {
  list: () => readJSON<Budget[]>(STORAGE_KEYS.budgets, []),
  save: (rows: Budget[]) => writeJSON(STORAGE_KEYS.budgets, rows),
};

export const settingsRepo = {
  get: (): Settings =>
    readJSON<Settings>(STORAGE_KEYS.settings, {
      currency: "INR",
      theme: "system",
      schemaVersion: SCHEMA_VERSION,
    }),
  save: (s: Settings) => writeJSON(STORAGE_KEYS.settings, s),
};
