import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { formatDocument, formatPhone } from "@/lib/format";
import { Plus, Mail, Phone, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const clients = await prisma.client.findMany({
    where: { userId },
    include: { projects: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            {clients.length} {clients.length === 1 ? "cliente" : "clientes"} cadastrados
          </p>
        </div>
        <Link
          href="/clients/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          Novo cliente
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground mb-4">
            Nenhum cliente cadastrado ainda.
          </p>
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Cadastrar primeiro cliente
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="space-y-1">
                <h3 className="font-semibold text-card-foreground">
                  {client.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {client.email && (
                    <span className="flex items-center gap-1">
                      <Mail size={13} />
                      {client.email}
                    </span>
                  )}
                  {client.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={13} />
                      {formatPhone(client.phone)}
                    </span>
                  )}
                  {client.document && (
                    <span className="flex items-center gap-1">
                      <FileText size={13} />
                      {formatDocument(client.document)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">
                  {client.projects.length}{" "}
                  {client.projects.length === 1 ? "projeto" : "projetos"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
