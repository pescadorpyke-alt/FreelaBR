import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-helpers";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const client = await prisma.client.findFirst({
    where: { id, userId: auth.userId },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
        include: { timeEntries: { select: { duration: true } } },
      },
    },
  });

  if (!client) {
    return Response.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  return Response.json(client);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const { name, email, document, phone, notes } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return Response.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  // Garante que o cliente pertence ao usuário
  const existing = await prisma.client.findFirst({
    where: { id, userId: auth.userId },
    select: { id: true },
  });
  if (!existing) {
    return Response.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  const client = await prisma.client.update({
    where: { id },
    data: {
      name: name.trim(),
      email: email?.trim() || null,
      document: document?.replace(/\D/g, "") || null,
      phone: phone?.replace(/\D/g, "") || null,
      notes: notes?.trim() || null,
    },
  });

  return Response.json(client);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const existing = await prisma.client.findFirst({
    where: { id, userId: auth.userId },
    select: { id: true },
  });
  if (!existing) {
    return Response.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  await prisma.client.delete({ where: { id } });

  return Response.json({ ok: true });
}
