import { useAppStore } from "@/lib/store";
import { formatMoney } from "@/lib/finance";

export function Money({ value, className }: { value: number; className?: string }) {
  const currency = useAppStore((s) => s.settings.currency);
  return <span className={className}>{formatMoney(value, currency)}</span>;
}
