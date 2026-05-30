import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { formatCurrency } from "@/lib/format";
import { Plus } from "lucide-react";
import Link from "next/link";
import { NewProjectForm } from "@/components/new-project-form";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const { clientId } = await searchParams;

  const [projects, clients] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      include: {
        client: { select: { id: true, name: true } },
        timeEntries: { select: { duration: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projetos</h1>
          <p className="text-sm text-muted-foreground">
            {projects.length} {projects.length === 1 ? "projeto" : "projetos"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {projects.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">
                Nenhum projeto ainda. Crie um ao lado.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {projects.map((project) => {
                const hours =
                  project.timeEntries.reduce(
                    (sum, e) => sum + (e.duration ?? 0),
                    0
                  ) / 3600;
                return (
                  <div
                    key={project.id}
                    className="p-4 rounded-xl border border-border bg-card"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          <Link
                            href={`/clients/${project.client.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {project.client.name}
                          </Link>
                          {" · "}
                          {project.rateType === "hourly"
                            ? `${formatCurrency(project.rateValue)}/h`
                            : `Fixo: ${formatCurrency(project.rateValue)}`}
                          {" · "}
                          {hours.toFixed(1)}h
                        </p>
                        {project.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${
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
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Plus size={16} />
              Novo projeto
            </h2>
            {clients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Cadastre um{" "}
                <Link href="/clients/new" className="text-primary hover:underline">
                  cliente
                </Link>{" "}
                primeiro.
              </p>
            ) : (
              <NewProjectForm clients={clients} defaultClientId={clientId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
