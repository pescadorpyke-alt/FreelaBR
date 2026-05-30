/**
 * Cálculo fiscal do MEI (Microempreendedor Individual).
 *
 * ⚠️ REVISAR ANUALMENTE: os valores do DAS mudam todo ano junto com o
 * salário mínimo, e o teto pode ser alterado por lei.
 * Valores de referência abaixo: ano-base 2025 (salário mínimo R$ 1.518,00).
 *
 * Importante: o MEI NÃO paga percentual sobre faturamento. Paga um DAS
 * (Documento de Arrecadação do Simples) FIXO mensal. O que precisa ser
 * controlado é o TETO DE FATURAMENTO anual.
 */

export type ActivityType = "servicos" | "comercio" | "ambos";

export const MEI_CONFIG = {
  /** Teto de faturamento anual do MEI (vigente desde 2018). */
  annualLimit: 81000,
  /**
   * Tolerância de 20%. Faturando até este valor, o MEI ainda pode
   * permanecer no regime (recolhendo a diferença); acima disso há
   * desenquadramento retroativo.
   */
  toleranceLimit: 81000 * 1.2, // R$ 97.200,00
  /**
   * DAS mensal fixo por tipo de atividade (ano-base 2025).
   * Composição: INSS (5% do salário mínimo) + ICMS (R$1) e/ou ISS (R$5).
   */
  das: {
    servicos: 80.9, // INSS R$ 75,90 + ISS R$ 5,00
    comercio: 76.9, // INSS R$ 75,90 + ICMS R$ 1,00
    ambos: 81.9, // INSS R$ 75,90 + ISS R$ 5,00 + ICMS R$ 1,00
  } as Record<ActivityType, number>,
} as const;

export type MeiStatusLevel = "safe" | "warning" | "danger" | "exceeded";

export interface MeiStatus {
  /** Faturamento acumulado no ano-calendário. */
  used: number;
  /** Teto anual (R$ 81.000). */
  limit: number;
  /** Percentual do teto já utilizado (0–100+). */
  percentage: number;
  /** Quanto ainda falta para atingir o teto (0 se já estourou). */
  remaining: number;
  /** Nível de alerta para a UI. */
  level: MeiStatusLevel;
  /** Mensagem amigável sobre a situação. */
  message: string;
}

/**
 * Calcula a situação do MEI em relação ao teto anual.
 */
export function getMeiStatus(annualRevenue: number): MeiStatus {
  const limit = MEI_CONFIG.annualLimit;
  const percentage = limit > 0 ? (annualRevenue / limit) * 100 : 0;
  const remaining = Math.max(0, limit - annualRevenue);

  let level: MeiStatusLevel;
  let message: string;

  if (annualRevenue > MEI_CONFIG.toleranceLimit) {
    level = "exceeded";
    message =
      "Faturamento ultrapassou o teto + tolerância de 20%. Há risco de desenquadramento retroativo do MEI.";
  } else if (annualRevenue > limit) {
    level = "danger";
    message =
      "Você ultrapassou o teto de R$ 81.000, mas ainda está dentro da tolerância de 20%. Avalie a migração para ME.";
  } else if (percentage >= 80) {
    level = "warning";
    message = "Você já usou mais de 80% do teto anual. Acompanhe de perto.";
  } else {
    level = "safe";
    message = "Faturamento dentro do limite do MEI.";
  }

  return { used: annualRevenue, limit, percentage, remaining, level, message };
}

/**
 * Retorna o valor do DAS mensal fixo para o tipo de atividade.
 */
export function getMonthlyDAS(activityType: ActivityType = "servicos"): number {
  return MEI_CONFIG.das[activityType];
}

/**
 * Projeção simples: dado o faturamento acumulado e o mês atual (0–11),
 * estima o faturamento anual mantido o ritmo médio mensal.
 */
export function projectAnnualRevenue(
  accumulatedRevenue: number,
  currentMonthIndex: number
): number {
  const monthsElapsed = currentMonthIndex + 1; // mês 0 = janeiro => 1 mês decorrido
  if (monthsElapsed <= 0) return accumulatedRevenue;
  const monthlyAverage = accumulatedRevenue / monthsElapsed;
  return monthlyAverage * 12;
}
