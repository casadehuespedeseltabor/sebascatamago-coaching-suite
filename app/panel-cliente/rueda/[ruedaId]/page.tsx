import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, getProfile } from "@/lib/supabase/server";
import DetalleRuedaCliente from "@/components/DetalleRuedaCliente";

export default async function DetalleRuedaPage({
  params,
}: {
  params: { ruedaId: string };
}) {
  const profile = await getProfile();
  const supabase = createClient();

  const { data: wheel } = await supabase
    .from("wheels")
    .select("id, label, created_at")
    .eq("id", params.ruedaId)
    .single();

  if (!wheel) notFound();

  const { data: categorias } = await supabase
    .from("wheel_categories")
    .select("name, score, note")
    .eq("wheel_id", wheel.id)
    .order("position");

  const { data: observaciones } = await supabase
    .from("coach_observations")
    .select("id, content, created_at")
    .eq("wheel_id", wheel.id)
    .order("created_at");

  const { data: otras } = await supabase
    .from("wheels")
    .select("id, label, created_at")
    .eq("client_id", profile!.id)
    .neq("id", wheel.id)
    .order("created_at", { ascending: false });

  const categoriasPorRueda: Record<string, { name: string; score: number; note: string | null }[]> = {};
  for (const r of otras ?? []) {
    const { data: cats } = await supabase
      .from("wheel_categories")
      .select("name, score, note")
      .eq("wheel_id", r.id)
      .order("position");
    categoriasPorRueda[r.id] = cats ?? [];
  }

  return (
    <main className="min-h-screen bg-guadua-50 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/panel-cliente" className="text-sm text-rio underline">
          ← Volver a tu historial
        </Link>
        <div className="mt-6">
          <DetalleRuedaCliente
            ruedaId={wheel.id}
            label={wheel.label}
            fecha={wheel.created_at}
            categorias={categorias ?? []}
            observaciones={observaciones ?? []}
            otrasRuedas={otras ?? []}
            categoriasPorRueda={categoriasPorRueda}
            nombreParaArchivo={`rueda-${wheel.label}-${new Date(wheel.created_at)
              .toISOString()
              .slice(0, 10)}`}
          />
        </div>
      </div>
    </main>
  );
}
