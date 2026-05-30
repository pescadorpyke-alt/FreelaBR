import { prisma } from "@/lib/prisma";

export const SETTINGS_ID = "default";

/** Retorna as configurações do freelancer, criando a linha padrão se necessário. */
export async function getSettings() {
  let settings = await prisma.settings.findUnique({
    where: { id: SETTINGS_ID },
  });

  if (!settings) {
    settings = await prisma.settings.create({
      data: { id: SETTINGS_ID, name: "" },
    });
  }

  return settings;
}
