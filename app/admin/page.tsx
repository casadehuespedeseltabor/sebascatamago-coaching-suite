import { createClient, getProfile } from "@/lib/supabase/server";
import CerrarSesionBoton from "@/components/CerrarSesionBoton";
import { BotonesCoachPendiente, BotonEliminarCuenta, BotonEliminarRueda } from "@/components/AdminAcciones";

export default async function AdminPage() {
  const profile = await getProfile();
  const supabase = createClient();

  const { data: coaches } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at, coach_profiles(status, bio)")
    .eq("role", "coach")
    .order("created_at", { ascending: false });

  const { data: clientes } = await supabase
    .from("profiles")
    .select("id, full_name, email, coach_id")
    .eq("role", "client");

  const { count: totalRuedas } = await supabase
    .from("wheels")
    .select("*", { count: "exact", head: true });

  const pendientes = (coaches ?? []).filter((c: any) => c.coach_profiles?.status === "pending");
  const aprobados = (coaches ?? []).filter((c: any) => c.coach_profiles?.status === "approved");

  const { data: ruedas } = await supabase
    .from("wheels")
    .select("id, label, created_at, client_id, coach_id")
    .order("created_at", { ascending: false })
    .limit(50);

  const perfilesPorId = new Map(
    [...(clientes ?? []), ...(coaches ?? [])].map((p: any) => [p.id, p.full_name])
  );

  return (
    <main className="min-h-screen bg-guadua-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-tinta/60">Panel de administración</p>
            <h1 className="text-2xl text-musgo-900">{profile?.full_name}</h1>
          </div>
          <CerrarSesionBoton />
        </header>

        <section className="mt-8 grid grid-cols-3 gap-4">
          <Metrica etiqueta="Coaches activos" valor={aprobados.length} />
          <Metrica etiqueta="Clientes totales" valor={clientes?.length ?? 0} />
          <Metrica etiqueta="Ruedas completadas" valor={totalRuedas ?? 0} />
        </section>

        {pendientes.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg text-musgo-900">
              Solicitudes pendientes ({pendientes.length})
            </h2>
            <ul className="mt-4 space-y-3">
              {pendientes.map((c: any) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-organico border border-guadua-300 bg-white px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-tinta">{c.full_name}</p>
                    <p className="text-sm text-tinta/50">{c.email}</p>
                    {c.coach_profiles?.bio && (
                      <p className="mt-1 text-sm text-tinta/70">{c.coach_profiles.bio}</p>
                    )}
                  </div>
                  <BotonesCoachPendiente profileId={c.id} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-lg text-musgo-900">Coaches aprobados ({aprobados.length})</h2>
          <ul className="mt-4 space-y-3">
            {aprobados.map((c: any) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-organico border border-guadua-200 bg-white px-5 py-4"
              >
                <div>
                  <p className="font-medium text-tinta">{c.full_name}</p>
                  <p className="text-sm text-tinta/50">{c.email}</p>
                </div>
                <BotonEliminarCuenta profileId={c.id} nombre={c.full_name} />
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg text-musgo-900">Clientes de la plataforma ({clientes?.length ?? 0})</h2>
          <ul className="mt-4 space-y-2">
            {(clientes ?? []).map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-guadua-100 bg-white px-4 py-2 text-sm"
              >
                <span>
                  {c.full_name} <span className="text-tinta/40">· {c.email}</span>
                </span>
                <BotonEliminarCuenta profileId={c.id} nombre={c.full_name} />
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg text-musgo-900">
            Ruedas de la Vida recientes ({ruedas?.length ?? 0})
          </h2>
          <p className="mt-1 text-xs text-tinta/50">
            Las calificaciones y notas nunca son editables por el
            administrador; solo puede eliminarse la rueda completa.
          </p>
          <ul className="mt-4 space-y-2">
            {(ruedas ?? []).map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-guadua-100 bg-white px-4 py-2 text-sm"
              >
                <span>
                  {r.label} · {perfilesPorId.get(r.client_id) ?? "cliente"}{" "}
                  <span className="text-tinta/40">
                    (coach: {perfilesPorId.get(r.coach_id) ?? "—"}) ·{" "}
                    {new Date(r.created_at).toLocaleDateString("es-CO")}
                  </span>
                </span>
                <BotonEliminarRueda wheelId={r.id} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function Metrica({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  return (
    <div className="rounded-organico border border-guadua-200 bg-white p-5 text-center">
      <p className="text-3xl text-musgo-900">{valor}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-tinta/50">{etiqueta}</p>
    </div>
  );
}
