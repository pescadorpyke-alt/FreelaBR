import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, password } = body;

  if (!name || (name as string).trim().length === 0) {
    return Response.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const normalizedEmail = (email as string)?.toLowerCase().trim();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return Response.json({ error: "Email inválido" }, { status: 400 });
  }

  if (!password || (password as string).length < 6) {
    return Response.json(
      { error: "A senha deve ter pelo menos 6 caracteres" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return Response.json(
      { error: "Já existe uma conta com este email" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password as string, 10);

  await prisma.user.create({
    data: {
      name: (name as string).trim(),
      email: normalizedEmail,
      passwordHash,
    },
  });

  return Response.json({ ok: true }, { status: 201 });
}
