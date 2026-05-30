"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Printer, Copy, Check, Trash2 } from "lucide-react";

interface InvoiceActionsProps {
  invoiceId: string;
  status: string;
  pixCode: string | null;
}

export function InvoiceActions({
  invoiceId,
  status,
  pixCode,
}: InvoiceActionsProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [updating, setUpdating] = useState(false);

  async function copyPix() {
    if (!pixCode) return;
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function changeStatus(newStatus: string) {
    setUpdating(true);
    setCurrentStatus(newStatus);
    await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdating(false);
    router.refresh();
  }

  async function deleteInvoice() {
    if (!confirm("Excluir este recibo? Esta ação não pode ser desfeita.")) {
      return;
    }
    const res = await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/invoices");
      router.refresh();
    }
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-3 mb-6">
      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
      >
        <Printer size={16} />
        Imprimir / Salvar PDF
      </button>

      {pixCode && (
        <button
          onClick={copyPix}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
          {copied ? "Copiado!" : "Copiar código Pix"}
        </button>
      )}

      <div className="flex items-center gap-2 ml-auto">
        <span className="text-sm text-muted-foreground">Status:</span>
        <select
          value={currentStatus}
          onChange={(e) => changeStatus(e.target.value)}
          disabled={updating}
          className="px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="draft">Rascunho</option>
          <option value="sent">Enviado</option>
          <option value="paid">Pago</option>
        </select>
      </div>

      <button
        onClick={deleteInvoice}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
