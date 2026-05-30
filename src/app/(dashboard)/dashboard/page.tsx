import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { Users, FolderOpen, Clock, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [clientCount, projectCount, timeEntries] = await Promise.all([
    prisma.client.count(),
    prisma.project.count(),
    prisma.timeEntry.findMany({
      where: { duration: { not: null } },
      select: {
        duration: true,
        project: { select: { rateValue: true, rateType: true } },
      },
    }),
  ]);

  const totalHours = timeEntries.reduce(
    (sum, e) => sum + (e.duration ?? 0),
    0
  ) / 3600;

  const totalEarned = timeEntries.reduce((sum, e) => {
    if (e.project.rateType === "hourly") {
      return sum + ((e.duration ?? 0) / 3600) * e.project.rateValue;
    }
    return sum;
  }, 0);

  const stats = [
    {
      label: "Clientes",
      value: clientCount,
      icon: Users,
      color: "text-primary",
    },
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
      label: "Faturamento (hora)",
      value: formatCurrency(totalEarned),
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl border border-border bg-card"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className={stat.color} />
              <span className="text-sm text-muted-foreground">
                {stat.label}
              </span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
