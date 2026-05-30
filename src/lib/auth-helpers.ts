import { auth } from "@/auth";

/**
 * Retorna o ID do usuário logado ou null.
 * Use em Server Components / páginas.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/**
 * Retorna o ID do usuário logado para rotas de API.
 * Lança uma Response 401 (capturada pelo handler) se não autenticado.
 */
export async function requireUserId(): Promise<
  { userId: string } | { error: Response }
> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return {
      error: Response.json({ error: "Não autenticado" }, { status: 401 }),
    };
  }
  return { userId };
}
