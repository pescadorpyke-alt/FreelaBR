import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-helpers";
import { NextRequest } from "next/server";

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const clients = await prisma.client.findMany({
    where: { userId: auth.userId },
    include: { projects: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(clients);
}

export async function POST(request: NextRequest) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { name, email, document, phone, notes } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return Response.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: {
      userId: auth.userId,
      name: name.trim(),
      email: email?.trim() || null,
      document: document?.replace(/\D/g, "") || null,
      phone: phone?.replace(/\D/g, "") || null,
      notes: notes?.trim() || null,
    },
  });

  return Response.json(client, { status: 201 });
}
