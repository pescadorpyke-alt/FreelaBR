import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ClientForm } from "@/components/client-form";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const { id } = await params;

  const client = await prisma.client.findFirst({
    where: { id, userId },
  });

  if (!client) notFound();

  return (
    <div>
      <Link
        href={`/clients/${client.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft size={14} />
        Voltar
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Editar cliente</h1>
        <p className="text-sm text-muted-foreground">
          Atualize os dados de {client.name}.
        </p>
      </div>

      <ClientForm initialData={client} />
    </div>
  );
}
