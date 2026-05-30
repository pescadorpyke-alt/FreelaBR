import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const clients = await prisma.client.findMany({
    include: { projects: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(clients);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { name, email, document, phone, notes } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return Response.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: {
      name: name.trim(),
      email: email?.trim() || null,
      document: document?.replace(/\D/g, "") || null,
      phone: phone?.replace(/\D/g, "") || null,
      notes: notes?.trim() || null,
    },
  });

  return Response.json(client, { status: 201 });
}
