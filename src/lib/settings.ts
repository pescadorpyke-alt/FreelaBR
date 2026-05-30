import { prisma } from "@/lib/prisma";

/** Retorna o perfil (dados do freelancer) do usuário logado. */
export async function getProfile(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}
