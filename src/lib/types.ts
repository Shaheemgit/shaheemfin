export type ID = string;
export type TxType = "income" | "expense" | "transfer";

export interface Account {
  id: ID;
  name: string;
  openingBalance: number;
  createdAt: string;
}

export interface Category {
  id: ID;
  name: string;
  kind: "income" | "expense";
}

export interface Transaction {
  id: ID;
  date: string; // ISO
  type: TxType;
  amount: number;
  categoryId?: ID;
  accountId: ID;
  toAccountId?: ID;
  notes?: string;
  createdAt: string;
}

export interface Budget {
  month: string; // YYYY-MM
  amount: number;
}

export interface Settings {
  currency: string;
  theme: "light" | "dark" | "system";
  schemaVersion: number;
}
