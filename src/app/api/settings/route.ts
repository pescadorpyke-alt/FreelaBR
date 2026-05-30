import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-helpers";
import { NextRequest } from "next/server";

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const user = await prisma.user.findUnique({ where: { id: auth.userId } });
  return Response.json(user);
}

export async function PUT(request: NextRequest) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { name, document, phone, pixKey, pixKeyType, city } = body;

  // Email não é alterável aqui (é o login da conta).
  const user = await prisma.user.update({
    where: { id: auth.userId },
    data: {
      name: (name ?? "").trim(),
      document: document?.replace(/\D/g, "") || null,
      phone: phone?.replace(/\D/g, "") || null,
      pixKey: pixKey?.trim() || null,
      pixKeyType: pixKeyType || null,
      city: city?.trim() || null,
    },
  });

  return Response.json(user);
}
