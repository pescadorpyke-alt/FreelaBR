import { ClientForm } from "@/components/client-form";

export default function NewClientPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Novo cliente</h1>
        <p className="text-sm text-muted-foreground">
          Preencha os dados do cliente.
        </p>
      </div>
      <ClientForm />
    </div>
  );
}
