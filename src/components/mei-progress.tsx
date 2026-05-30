import { formatCurrency } from "@/lib/format";
import { getMeiStatus, type MeiStatusLevel } from "@/lib/tax";
import { AlertTriangle, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

const levelStyles: Record<
  MeiStatusLevel,
  { bar: string; text: string; bg: string; Icon: typeof CheckCircle2 }
> = {
  safe: {
    bar: "bg-success",
    text: "text-success",
    bg: "bg-success/10",
    Icon: CheckCircle2,
  },
  warning: {
    bar: "bg-warning",
    text: "text-warning",
    bg: "bg-warning/10",
    Icon: AlertCircle,
  },
  danger: {
    bar: "bg-destructive",
    text: "text-destructive",
    bg: "bg-destructive/10",
    Icon: AlertTriangle,
  },
  exceeded: {
    bar: "bg-destructive",
    text: "text-destructive",
    bg: "bg-destructive/10",
    Icon: XCircle,
  },
};

export function MeiProgress({ annualRevenue }: { annualRevenue: number }) {
  const status = getMeiStatus(annualRevenue);
  const style = levelStyles[status.level];
  const { Icon } = style;
  const barWidth = Math.min(100, status.percentage);

  return (
    <div className="p-5 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold">Teto do MEI</h2>
          <p className="text-sm text-muted-foreground">
            Faturamento de {new Date().getFullYear()}
          </p>
        </div>
        <span className={`text-sm font-medium ${style.text}`}>
          {status.percentage.toFixed(1)}%
        </span>
      </div>

      <div className="h-3 rounded-full bg-muted overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all ${style.bar}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm mb-4">
        <span className="font-medium">{formatCurrency(status.used)}</span>
        <span className="text-muted-foreground">
          de {formatCurrency(status.limit)}
        </span>
      </div>

      <div className={`flex items-start gap-2 p-3 rounded-lg ${style.bg}`}>
        <Icon size={16} className={`${style.text} shrink-0 mt-0.5`} />
        <p className={`text-sm ${style.text}`}>{status.message}</p>
      </div>

      {status.level === "safe" || status.level === "warning" ? (
        <p className="text-xs text-muted-foreground mt-3">
          Faltam {formatCurrency(status.remaining)} para o teto.
        </p>
      ) : null}
    </div>
  );
}
