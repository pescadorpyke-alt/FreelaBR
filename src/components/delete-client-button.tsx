"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteClientButton({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        `Tem certeza que deseja excluir "${clientName}"? Todos os projetos e registros de tempo serão apagados.`
      )
    ) {
      return;
    }

    setLoading(true);

    const res = await fetch(`/api/clients/${clientId}`, { method: "DELETE" });

    if (res.ok) {
      router.push("/clients");
      router.refresh();
    } else {
      alert("Erro ao excluir cliente");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 disabled:opacity-50 transition-colors"
    >
      <Trash2 size={14} />
      {loading ? "Excluindo..." : "Excluir"}
    </button>
  );
}
