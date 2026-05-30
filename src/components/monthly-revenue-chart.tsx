import { formatCurrency } from "@/lib/format";

const MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export function MonthlyRevenueChart({ byMonth }: { byMonth: number[] }) {
  const max = Math.max(...byMonth, 1);

  return (
    <div className="p-5 rounded-xl border border-border bg-card">
      <h2 className="font-semibold mb-4">Faturamento por mês</h2>
      <div className="flex items-stretch justify-between gap-2 h-40">
        {byMonth.map((value, i) => {
          const heightPct = (value / max) * 100;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-2 group relative"
            >
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t bg-primary/80 hover:bg-primary transition-colors min-h-[2px]"
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {MONTHS[i]}
              </span>
              {value > 0 && (
                <div className="absolute bottom-full mb-1 hidden group-hover:block whitespace-nowrap text-xs bg-foreground text-background px-2 py-1 rounded">
                  {formatCurrency(value)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
