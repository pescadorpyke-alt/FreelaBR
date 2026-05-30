import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { getAnnualRevenue } from "@/lib/revenue";
import { getMonthlyDAS } from "@/lib/tax";
import { MeiProgress } from "@/components/mei-progress";
import { Users, FolderOpen, Clock, DollarSign, Receipt } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const currentYear = new Date().getFullYear();

  const [clientCount, projectCount, timeEntries, annualRevenue] =
    await Promise.all([
      prisma.client.count(),
      prisma.project.count(),
      prisma.timeEntry.findMany({
        where: { duration: { not: null } },
        select: { duration: true },
      }),
      getAnnualRevenue(currentYear),
    ]);

  const totalHours =
    timeEntries.reduce((sum, e) => sum + (e.duration ?? 0), 0) / 3600;

  const monthlyDAS = getMonthlyDAS("servicos");

  const stats = [
    { label: "Clientes", value: clientCount, icon: Users, color: "text-primary" },
    {
      label: "Projetos",
      value: projectCount,
      icon: FolderOpen,
      color: "text-success",
    },
    {
      label: "Horas registradas",
      value: `${totalHours.toFixed(1)}h`,
      icon: Clock,
      color: "text-warning",
    },
    {
      label: `Faturamento ${currentYear}`,
      value: formatCurrency(annualRevenue.total),
      icon: DollarSign,
      color: "text-primary",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral dos seus projetos e faturamento.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl border border-border bg-card"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className={stat.color} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MeiProgress annualRevenue={annualRevenue.total} />
        </div>

        <div className="p-5 rounded-xl border border-border bg-card flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={16} className="text-primary" />
            <h2 className="font-semibold">DAS mensal</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Valor fixo do MEI (serviços)
          </p>
          <p className="text-3xl font-bold mb-1">{formatCurrency(monthlyDAS)}</p>
          <p className="text-xs text-muted-foreground mt-auto">
            INSS + ISS · vencimento todo dia 20
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        * Faturamento estimado a partir das horas registradas e projetos fixos.
        Valores fiscais de referência do ano-base 2025 — confira a legislação
        vigente.
      </p>
    </div>
  );
}
