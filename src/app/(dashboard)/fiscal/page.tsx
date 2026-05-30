import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { formatCurrency } from "@/lib/format";
import { getAnnualRevenue } from "@/lib/revenue";
import {
  getMonthlyDAS,
  getMeiStatus,
  projectAnnualRevenue,
  MEI_CONFIG,
} from "@/lib/tax";
import { MeiProgress } from "@/components/mei-progress";
import { MonthlyRevenueChart } from "@/components/monthly-revenue-chart";
import { TrendingUp, Receipt, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FiscalPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const annualRevenue = await getAnnualRevenue(userId, currentYear);
  const status = getMeiStatus(annualRevenue.total);
  const monthlyDAS = getMonthlyDAS("servicos");
  const projection = projectAnnualRevenue(annualRevenue.total, currentMonth);
  const projectionStatus = getMeiStatus(projection);
  const annualDAS = monthlyDAS * 12;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Fiscal — MEI</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe o teto de faturamento e suas obrigações como MEI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <MeiProgress annualRevenue={annualRevenue.total} />
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Receipt size={16} className="text-primary" />
              <h2 className="font-semibold text-sm">DAS mensal</h2>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(monthlyDAS)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(annualDAS)} por ano
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-warning" />
              <h2 className="font-semibold text-sm">Projeção anual</h2>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(projection)}</p>
            <p
              className={`text-xs mt-1 ${
                projectionStatus.level === "safe"
                  ? "text-muted-foreground"
                  : "text-warning"
              }`}
            >
              {projectionStatus.level === "safe"
                ? "Dentro do teto no ritmo atual"
                : `${projectionStatus.percentage.toFixed(0)}% do teto no ritmo atual`}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <MonthlyRevenueChart byMonth={annualRevenue.byMonth} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted-foreground">Por hora</p>
          <p className="text-xl font-bold mt-1">
            {formatCurrency(annualRevenue.hourlyRevenue)}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted-foreground">Projetos fixos</p>
          <p className="text-xl font-bold mt-1">
            {formatCurrency(annualRevenue.fixedRevenue)}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted-foreground">Média mensal</p>
          <p className="text-xl font-bold mt-1">
            {formatCurrency(annualRevenue.total / (currentMonth + 1))}
          </p>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-muted-foreground" />
          <h2 className="font-semibold">Referência MEI {currentYear}</h2>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div className="flex justify-between border-b border-border py-1">
            <dt className="text-muted-foreground">Teto anual</dt>
            <dd className="font-medium">
              {formatCurrency(MEI_CONFIG.annualLimit)}
            </dd>
          </div>
          <div className="flex justify-between border-b border-border py-1">
            <dt className="text-muted-foreground">Teto + tolerância (20%)</dt>
            <dd className="font-medium">
              {formatCurrency(MEI_CONFIG.toleranceLimit)}
            </dd>
          </div>
          <div className="flex justify-between border-b border-border py-1">
            <dt className="text-muted-foreground">DAS serviços (ISS)</dt>
            <dd className="font-medium">
              {formatCurrency(MEI_CONFIG.das.servicos)}
            </dd>
          </div>
          <div className="flex justify-between border-b border-border py-1">
            <dt className="text-muted-foreground">DAS comércio (ICMS)</dt>
            <dd className="font-medium">
              {formatCurrency(MEI_CONFIG.das.comercio)}
            </dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground mt-4">
          Valores de referência do ano-base 2025. O DAS é reajustado anualmente
          conforme o salário mínimo. Faturamento estimado a partir das horas e
          projetos registrados — não substitui sua contabilidade oficial.
        </p>
      </div>
    </div>
  );
}
