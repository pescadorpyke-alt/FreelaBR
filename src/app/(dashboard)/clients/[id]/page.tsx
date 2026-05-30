import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { formatDocument, formatPhone, formatCurrency } from "@/lib/format";
import { Pencil, Mail, Phone, FileText, ArrowLeft } from "lucide-react";
import { DeleteClientButton } from "@/components/delete-client-button";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const { id } = await params;

  const client = await prisma.client.findFirst({
    where: { id, userId },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
        include: {
          timeEntries: { select: { duration: true } },
        },
      },
    },
  });

  if (!client) notFound();

  const totalHours = client.projects.reduce((acc, project) => {
    const projectSeconds = project.timeEntries.reduce(
      (sum, entry) => sum + (entry.duration ?? 0),
      0
    );
    return acc + projectSeconds;
  }, 0) / 3600;

  const totalValue = client.projects.reduce((acc, project) => {
    if (project.rateType === "fixed") return acc + project.rateValue;
    const projectHours =
      project.timeEntries.reduce(
        (sum, entry) => sum + (entry.duration ?? 0),
        0
      ) / 3600;
    return acc + projectHours * project.rateValue;
  }, 0);

  return (
    <div>
      <Link
        href="/clients"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft size={14} />
        Voltar
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{client.name}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
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
        <div className="flex gap-2">
          <Link
            href={`/clients/${client.id}/edit`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            <Pencil size={14} />
            Editar
          </Link>
          <DeleteClientButton clientId={client.id} clientName={client.name} />
        </div>
      </div>

      {client.notes && (
        <div className="p-4 rounded-xl border border-border bg-card mb-6">
          <p className="text-sm text-muted-foreground">{client.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted-foreground">Projetos</p>
          <p className="text-2xl font-bold mt-1">{client.projects.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted-foreground">Horas trabalhadas</p>
          <p className="text-2xl font-bold mt-1">{totalHours.toFixed(1)}h</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted-foreground">Valor total</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalValue)}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Projetos</h2>
          <Link
            href={`/projects?clientId=${client.id}`}
            className="text-sm text-primary hover:underline"
          >
            + Novo projeto
          </Link>
        </div>

        {client.projects.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-xl">
            <p className="text-sm text-muted-foreground">
              Nenhum projeto para este cliente.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {client.projects.map((project) => {
              const hours =
                project.timeEntries.reduce(
                  (sum, e) => sum + (e.duration ?? 0),
                  0
                ) / 3600;
              return (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-card"
                >
                  <div>
                    <h3 className="font-medium">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {project.rateType === "hourly"
                        ? `${formatCurrency(project.rateValue)}/h`
                        : `Fixo: ${formatCurrency(project.rateValue)}`}
                      {" · "}
                      {hours.toFixed(1)}h registradas
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      project.status === "active"
                        ? "bg-success/10 text-success"
                        : project.status === "completed"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {project.status === "active"
                      ? "Ativo"
                      : project.status === "completed"
                      ? "Concluído"
                      : "Arquivado"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
