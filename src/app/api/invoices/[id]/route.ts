import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true, project: true },
  });

  if (!invoice) {
    return Response.json({ error: "Recibo não encontrado" }, { status: 404 });
  }

  return Response.json(invoice);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  const allowed = ["draft", "sent", "paid"];
  if (!allowed.includes(status)) {
    return Response.json({ error: "Status inválido" }, { status: 400 });
  }

  const invoice = await prisma.invoice.update({
    where: { id },
    data: { status },
  });

  return Response.json(invoice);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.invoice.delete({ where: { id } });
  return Response.json({ ok: true });
}
