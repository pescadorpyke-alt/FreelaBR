import { prisma } from "@/lib/prisma";
import { getSettings, SETTINGS_ID } from "@/lib/settings";
import { NextRequest } from "next/server";

export async function GET() {
  const settings = await getSettings();
  return Response.json(settings);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { name, document, email, phone, pixKey, pixKeyType, city } = body;

  const data = {
    name: (name ?? "").trim(),
    document: document?.replace(/\D/g, "") || null,
    email: email?.trim() || null,
    phone: phone?.replace(/\D/g, "") || null,
    pixKey: pixKey?.trim() || null,
    pixKeyType: pixKeyType || null,
    city: city?.trim() || null,
  };

  const settings = await prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: { id: SETTINGS_ID, ...data },
  });

  return Response.json(settings);
}
