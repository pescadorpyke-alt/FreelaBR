import { prisma } from "@/lib/prisma";

export interface AnnualRevenue {
  year: number;
  /** Faturamento por hora realizado no ano (time entries × rate). */
  hourlyRevenue: number;
  /** Valor de projetos fixos criados no ano. */
  fixedRevenue: number;
  /** Total estimado do ano. */
  total: number;
  /** Faturamento acumulado por mês (índice 0 = janeiro). */
  byMonth: number[];
}

/**
 * Calcula o faturamento estimado de um ano-calendário para um usuário.
 *
 * Observação: enquanto não há registro de pagamentos/invoices, o
 * faturamento é estimado a partir de:
 *  - projetos por hora: soma das horas registradas no ano × valor/hora
 *  - projetos fixos: valor do projeto, alocado no mês de criação
 */
export async function getAnnualRevenue(
  userId: string,
  year: number = new Date().getFullYear()
): Promise<AnnualRevenue> {
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const [entries, fixedProjects] = await Promise.all([
    prisma.timeEntry.findMany({
      where: {
        duration: { not: null },
        startedAt: { gte: start, lt: end },
        project: { rateType: "hourly", userId },
      },
      select: {
        duration: true,
        startedAt: true,
        project: { select: { rateValue: true } },
      },
    }),
    prisma.project.findMany({
      where: {
        userId,
        rateType: "fixed",
        createdAt: { gte: start, lt: end },
      },
      select: { rateValue: true, createdAt: true },
    }),
  ]);

  const byMonth = new Array(12).fill(0);

  let hourlyRevenue = 0;
  for (const entry of entries) {
    const value = ((entry.duration ?? 0) / 3600) * entry.project.rateValue;
    hourlyRevenue += value;
    byMonth[entry.startedAt.getMonth()] += value;
  }

  let fixedRevenue = 0;
  for (const project of fixedProjects) {
    fixedRevenue += project.rateValue;
    byMonth[project.createdAt.getMonth()] += project.rateValue;
  }

  return {
    year,
    hourlyRevenue,
    fixedRevenue,
    total: hourlyRevenue + fixedRevenue,
    byMonth,
  };
}
