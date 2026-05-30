"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface NewProjectFormProps {
  clients: { id: string; name: string }[];
  defaultClientId?: string;
}

export function NewProjectForm({ clients, defaultClientId }: NewProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      clientId: form.get("clientId") as string,
      description: form.get("description") as string,
      rateType: form.get("rateType") as string,
      rateValue: parseFloat(form.get("rateValue") as string) || 0,
    };

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Erro ao criar projeto");
      setLoading(false);
      return;
    }

    e.currentTarget.reset();
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="p-2 rounded-lg bg-destructive/10 text-destructive text-xs">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="proj-name" className="block text-xs font-medium mb-1">
          Nome do projeto *
        </label>
        <input
          id="proj-name"
          name="name"
          type="text"
          required
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Ex: Redesign do site"
        />
      </div>

      <div>
        <label htmlFor="proj-client" className="block text-xs font-medium mb-1">
          Cliente *
        </label>
        <select
          id="proj-client"
          name="clientId"
          required
          defaultValue={defaultClientId || ""}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="" disabled>
            Selecione...
          </option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="proj-desc" className="block text-xs font-medium mb-1">
          Descrição
        </label>
        <input
          id="proj-desc"
          name="description"
          type="text"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Breve descrição"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="proj-rate-type" className="block text-xs font-medium mb-1">
            Tipo
          </label>
          <select
            id="proj-rate-type"
            name="rateType"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="hourly">Por hora</option>
            <option value="fixed">Fixo</option>
          </select>
        </div>
        <div>
          <label htmlFor="proj-rate-value" className="block text-xs font-medium mb-1">
            Valor (R$)
          </label>
          <input
            id="proj-rate-value"
            name="rateValue"
            type="number"
            step="0.01"
            min="0"
            defaultValue="0"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {loading ? "Criando..." : "Criar projeto"}
      </button>
    </form>
  );
}
