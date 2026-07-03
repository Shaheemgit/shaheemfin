import { Plus } from "lucide-react";
import { useTransactionDialog } from "@/components/transactions/TransactionDialog";

export function Fab() {
  const open = useTransactionDialog((s) => s.open);
  return (
    <button
      onClick={() => open()}
      aria-label="Add transaction"
      className="fixed right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95"
      style={{ bottom: "calc(72px + env(safe-area-inset-bottom))" }}
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
