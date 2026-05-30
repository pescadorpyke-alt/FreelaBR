import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const invoices = await prisma.invoice.findMany({
    include: {
      client: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy: { number: "desc" },
  });
  return Response.json(invoices);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { clientId, projectId, description, amount, dueDate } = body;

  if (!clientId) {
    return Response.json({ error: "Cliente é obrigatório" }, { status: 400 });
  }
  if (!description || description.trim().length === 0) {
    return Response.json({ error: "Descrição é obrigatória" }, { status: 400 });
  }
  const parsedAmount = typeof amount === "number" ? amount : parseFloat(amount);
  if (!parsedAmount || parsedAmount <= 0) {
    return Response.json(
      { error: "Valor deve ser maior que zero" },
      { status: 400 }
    );
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return Response.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  // Próximo número sequencial
  const last = await prisma.invoice.findFirst({
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const nextNumber = (last?.number ?? 0) + 1;

  const invoice = await prisma.invoice.create({
    data: {
      number: nextNumber,
      clientId,
      projectId: projectId || null,
      description: description.trim(),
      amount: parsedAmount,
      dueDate: dueDate ? new Date(dueDate) : null,
      txid: `FREELABR${nextNumber.toString().padStart(4, "0")}`,
    },
  });

  return Response.json(invoice, { status: 201 });
}
