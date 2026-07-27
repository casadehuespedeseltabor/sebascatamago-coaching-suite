import Link from "next/link";
import { headers } from "next/headers";
import { createClient, getProfile } from "@/lib/supabase/server";
import CerrarSesionBoton from "@/components/CerrarSesionBoton";
import GenerarInvitacion from "@/components/GenerarInvitacion";

export default async function PanelCoachPage() {
  const profile = await getProfile();
  const supabase = createClient();

  const { data: coachProfile } = await supabase
    .from("coach_profiles")
    .select("status")
    .eq("profile_id", profile!.id)
    .single();

  if (coachProfile?.status !== "approved") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-guadua-50 px-6 text-center">
        <div className="max-w-md">
          <h1 className="text-2xl text-musgo-900">
            {coachProfile?.status === "rejected" ? "Solicitud rechazada" : "Cuenta pendiente"}
          </h1>
          <p className="mt-3 text-tinta/75">
            {coachProfile?.status === "rejected"
              ? "El administrador no aprobó esta solicitud de coach."
              : "Tu cuenta de coach todavía no ha sido aprobada por el administrador."}
          </p>
          <div className="mt-6">
            <CerrarSesionBoton />
          </div>
        </div>
      </main>
    );
  }

  const { data: clientes } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("coach_id", profile!.id)
    .order("created_at", { ascending: false });

  const { data: invitaciones } = await supabase
    .from("invitations")
    .select("id, code, max_uses, uses_count, expires_at, revoked")
    .eq("coach_id", profile!.id)
    .order("created_at", { ascending: false });

  const h = headers();
  const origen = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;

  return (
    <main className="min-h-screen bg-guadua-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-tinta/60">Panel de coach</p>
            <h1 className="text-2xl text-musgo-900">{profile?.full_name}</h1>
          </div>
          <CerrarSesionBoton />
        </header>

        <section className="mt-8">
          <GenerarInvitacion invitacionesIniciales={invitaciones ?? []} origenUrl={origen} />
        </section>

        <section className="mt-10">
          <h2 className="text-lg text-musgo-900">Tus clientes ({clientes?.length ?? 0})</h2>
          {!clientes || clientes.length === 0 ? (
            <p className="mt-3 text-sm text-tinta/60">
              Aún no tienes clientes. Genera un link de invitación y compártelo.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {clientes.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/panel-coach/cliente/${c.id}`}
                    className="block rounded-organico border border-guadua-200 bg-white px-5 py-4 transition hover:border-guadua-400"
                  >
                    <span className="font-medium text-tinta">{c.full_name}</span>
                    <span className="ml-3 text-sm text-tinta/50">{c.email}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
