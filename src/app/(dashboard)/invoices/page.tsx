import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, { label: string; className: string }> = {
  draft: { label: "Rascunho", className: "bg-muted text-muted-foreground" },
  sent: { label: "Enviado", className: "bg-primary/10 text-primary" },
  paid: { label: "Pago", className: "bg-success/10 text-success" },
};

export default async function InvoicesPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const invoices = await prisma.invoice.findMany({
    where: { userId },
    include: { client: { select: { name: true } } },
    orderBy: { number: "desc" },
  });

  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Recibos</h1>
          <p className="text-sm text-muted-foreground">
            {invoices.length} {invoices.length === 1 ? "recibo" : "recibos"}
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          Novo recibo
        </Link>
      </div>

      {invoices.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-border bg-card">
            <p className="text-sm text-muted-foreground">Recebido</p>
            <p className="text-xl font-bold mt-1 text-success">
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <p className="text-sm text-muted-foreground">A receber</p>
            <p className="text-xl font-bold mt-1">
              {formatCurrency(totalPending)}
            </p>
          </div>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <FileText size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">
            Nenhum recibo emitido ainda.
          </p>
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Criar primeiro recibo
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {invoices.map((invoice) => {
            const status = statusLabels[invoice.status] ?? statusLabels.draft;
            return (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-muted-foreground">
                    #{invoice.number.toString().padStart(4, "0")}
                  </span>
                  <div>
                    <h3 className="font-medium">{invoice.client.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {invoice.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">
                    {formatCurrency(invoice.amount)}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
