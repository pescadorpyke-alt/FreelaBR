import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
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
  const { id } = await params;
  const body = await request.json();
  const { name, email, document, phone, notes } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return Response.json({ error: "Nome é obrigatório" }, { status: 400 });
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
  const { id } = await params;

  await prisma.client.delete({ where: { id } });

  return Response.json({ ok: true });
}
