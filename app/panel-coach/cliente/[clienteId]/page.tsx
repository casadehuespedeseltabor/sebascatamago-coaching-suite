import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, getProfile } from "@/lib/supabase/server";
import PanelCoachClienteDetalle from "@/components/PanelCoachClienteDetalle";

export default async function ClienteDetallePage({
  params,
}: {
  params: { clienteId: string };
}) {
  const profile = await getProfile();
  const supabase = createClient();

  const { data: cliente } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", params.clienteId)
    .eq("coach_id", profile!.id) // el RLS ya lo garantiza, esto solo evita un notFound confuso
    .single();

  if (!cliente) notFound();

  const { data: ruedas } = await supabase
    .from("wheels")
    .select("id, label, created_at")
    .eq("client_id", cliente.id)
    .order("created_at", { ascending: false });

  const categoriasPorRueda: Record<string, { name: string; score: number; note: string | null }[]> = {};
  for (const r of ruedas ?? []) {
    const { data: cats } = await supabase
      .from("wheel_categories")
      .select("name, score, note")
      .eq("wheel_id", r.id)
      .order("position");
    categoriasPorRueda[r.id] = cats ?? [];
  }

  const { data: observaciones } = await supabase
    .from("coach_observations")
    .select("id, wheel_id, content, created_at")
    .in("wheel_id", (ruedas ?? []).map((r) => r.id));

  return (
    <main className="min-h-screen bg-guadua-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/panel-coach" className="text-sm text-rio underline">
          ← Volver a tus clientes
        </Link>
        <h1 className="mt-4 text-2xl text-musgo-900">{cliente.full_name}</h1>
        <p className="text-sm text-tinta/60">{cliente.email}</p>

        <div className="mt-8">
          <PanelCoachClienteDetalle
            ruedas={ruedas ?? []}
            categoriasPorRueda={categoriasPorRueda}
            observaciones={observaciones ?? []}
          />
        </div>
      </div>
    </main>
  );
}
