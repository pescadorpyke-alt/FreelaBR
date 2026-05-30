import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId, description, startedAt, stoppedAt } = body;

  if (!projectId || !startedAt || !stoppedAt) {
    return Response.json(
      { error: "projectId, startedAt e stoppedAt são obrigatórios" },
      { status: 400 }
    );
  }

  const start = new Date(startedAt);
  const stop = new Date(stoppedAt);
  const duration = Math.floor((stop.getTime() - start.getTime()) / 1000);

  if (duration < 1) {
    return Response.json(
      { error: "Duração deve ser de pelo menos 1 segundo" },
      { status: 400 }
    );
  }

  const entry = await prisma.timeEntry.create({
    data: {
      projectId,
      description: description || null,
      startedAt: start,
      stoppedAt: stop,
      duration,
    },
  });

  return Response.json(entry, { status: 201 });
}

export async function GET() {
  const entries = await prisma.timeEntry.findMany({
    where: { stoppedAt: { not: null } },
    include: {
      project: {
        select: { name: true, client: { select: { name: true } } },
      },
    },
    orderBy: { startedAt: "desc" },
    take: 50,
  });

  return Response.json(entries);
}
