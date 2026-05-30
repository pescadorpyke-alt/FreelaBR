"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
  projects: { id: string; name: string }[];
}

export function NewInvoiceForm({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedClient, setSelectedClient] = useState(clients[0]?.id ?? "");

  const projects = clients.find((c) => c.id === selectedClient)?.projects ?? [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = {
      clientId: form.get("clientId") as string,
      projectId: (form.get("projectId") as string) || null,
      description: form.get("description") as string,
      amount: parseFloat(form.get("amount") as string),
      dueDate: (form.get("dueDate") as string) || null,
    };

    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Erro ao criar recibo");
      setLoading(false);
      return;
    }

    const invoice = await res.json();
    router.push(`/invoices/${invoice.id}`);
    router.refresh();
  }

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="clientId" className="block text-sm font-medium mb-1">
          Cliente *
        </label>
        <select
          id="clientId"
          name="clientId"
          required
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className={inputClass}
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {projects.length > 0 && (
        <div>
          <label htmlFor="projectId" className="block text-sm font-medium mb-1">
            Projeto (opcional)
          </label>
          <select id="projectId" name="projectId" className={inputClass}>
            <option value="">Nenhum</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Descrição do serviço *
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={2}
          className={`${inputClass} resize-none`}
          placeholder="Ex: Desenvolvimento de landing page"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-1">
            Valor (R$) *
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            className={inputClass}
            placeholder="0,00"
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
            Vencimento
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Gerando..." : "Gerar recibo"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
