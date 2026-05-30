"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

interface SettingsData {
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  pixKey: string | null;
  pixKeyType: string | null;
  city: string | null;
}

export function SettingsForm({ initialData }: { initialData: SettingsData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      document: form.get("document") as string,
      email: form.get("email") as string,
      phone: form.get("phone") as string,
      pixKey: form.get("pixKey") as string,
      pixKeyType: form.get("pixKeyType") as string,
      city: form.get("city") as string,
    };

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      setError("Erro ao salvar configurações");
      setLoading(false);
      return;
    }

    setSaved(true);
    setLoading(false);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Seus dados
        </h2>
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Nome / Razão social *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initialData.name}
            className={inputClass}
            placeholder="Seu nome ou da empresa"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="document" className="block text-sm font-medium mb-1">
              CPF / CNPJ
            </label>
            <input
              id="document"
              name="document"
              type="text"
              defaultValue={initialData.document ?? ""}
              className={inputClass}
              placeholder="000.000.000-00"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-1">
              Cidade
            </label>
            <input
              id="city"
              name="city"
              type="text"
              defaultValue={initialData.city ?? ""}
              className={inputClass}
              placeholder="Sua cidade"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email (login)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={initialData.email ?? ""}
              readOnly
              disabled
              className={`${inputClass} opacity-60 cursor-not-allowed`}
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Telefone
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              defaultValue={initialData.phone ?? ""}
              className={inputClass}
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Pix para recebimento
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="pixKeyType" className="block text-sm font-medium mb-1">
              Tipo da chave
            </label>
            <select
              id="pixKeyType"
              name="pixKeyType"
              defaultValue={initialData.pixKeyType ?? "email"}
              className={inputClass}
            >
              <option value="email">Email</option>
              <option value="phone">Telefone</option>
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
              <option value="random">Aleatória</option>
            </select>
          </div>
          <div className="col-span-2">
            <label htmlFor="pixKey" className="block text-sm font-medium mb-1">
              Chave Pix
            </label>
            <input
              id="pixKey"
              name="pixKey"
              type="text"
              defaultValue={initialData.pixKey ?? ""}
              className={inputClass}
              placeholder="Sua chave Pix"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          A chave Pix é usada para gerar o QR Code de cobrança nos recibos. Ela
          fica salva apenas no seu banco de dados local.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Salvando..." : "Salvar configurações"}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-success">
            <Check size={16} />
            Salvo!
          </span>
        )}
      </div>
    </form>
  );
}
