import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { getProfile } from "@/lib/settings";
import { SettingsForm } from "@/components/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const profile = await getProfile(userId);
  if (!profile) redirect("/login");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Seus dados e chave Pix para emissão de recibos.
        </p>
      </div>
      <SettingsForm initialData={profile} />
    </div>
  );
}
