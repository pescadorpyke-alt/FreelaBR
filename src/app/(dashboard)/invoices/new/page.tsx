import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { NewInvoiceForm } from "@/components/new-invoice-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const clients = await prisma.client.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      projects: {
        where: { status: { not: "archived" } },
        select: { id: true, name: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return (
    <div>
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft size={14} />
        Voltar
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Novo recibo</h1>
        <p className="text-sm text-muted-foreground">
          Gere um recibo com QR Code Pix para enviar ao cliente.
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground mb-4">
            Cadastre um cliente antes de gerar recibos.
          </p>
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            Cadastrar cliente
          </Link>
        </div>
      ) : (
        <NewInvoiceForm clients={clients} />
      )}
    </div>
  );
}
