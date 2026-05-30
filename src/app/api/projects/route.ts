import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-helpers";
import { NextRequest } from "next/server";

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const projects = await prisma.project.findMany({
    where: { userId: auth.userId },
    include: {
      client: { select: { id: true, name: true } },
      timeEntries: { select: { duration: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(projects);
}

export async function POST(request: NextRequest) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { name, clientId, description, rateType, rateValue } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return Response.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  if (!clientId) {
    return Response.json({ error: "Cliente é obrigatório" }, { status: 400 });
  }

  // Cliente precisa pertencer ao usuário
  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: auth.userId },
    select: { id: true },
  });
  if (!client) {
    return Response.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  const project = await prisma.project.create({
    data: {
      userId: auth.userId,
      name: name.trim(),
      clientId,
      description: description?.trim() || null,
      rateType: rateType === "fixed" ? "fixed" : "hourly",
      rateValue: typeof rateValue === "number" ? rateValue : 0,
    },
  });

  return Response.json(project, { status: 201 });
}
