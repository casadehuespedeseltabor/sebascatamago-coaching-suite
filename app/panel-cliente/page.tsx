import Link from "next/link";
import { createClient, getProfile } from "@/lib/supabase/server";
import CerrarSesionBoton from "@/components/CerrarSesionBoton";

export default async function PanelClientePage() {
  const profile = await getProfile();
  const supabase = createClient();

  const { data: wheels } = await supabase
    .from("wheels")
    .select("id, label, created_at")
    .eq("client_id", profile!.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-guadua-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-tinta/60">Hola, {profile?.full_name}</p>
            <h1 className="text-2xl text-musgo-900">Tu Rueda de la Vida</h1>
          </div>
          <CerrarSesionBoton />
        </header>

        <Link
          href="/panel-cliente/nueva-rueda"
          className="mt-8 inline-block rounded-organico bg-guadua-500 px-6 py-2.5 font-medium text-white transition hover:bg-guadua-600"
        >
          + Diligenciar nueva Rueda de la Vida
        </Link>

        <section className="mt-10">
          <h2 className="text-lg text-musgo-900">Historial</h2>
          {!wheels || wheels.length === 0 ? (
            <p className="mt-3 text-sm text-tinta/60">
              Aún no has diligenciado ninguna rueda. La primera es el punto de
              partida de tu proceso.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {wheels.map((w) => (
                <li key={w.id}>
                  <Link
                    href={`/panel-cliente/rueda/${w.id}`}
                    className="block rounded-organico border border-guadua-200 bg-white px-5 py-4 transition hover:border-guadua-400"
                  >
                    <span className="font-medium text-tinta">{w.label}</span>
                    <span className="ml-3 text-sm text-tinta/50">
                      {new Date(w.created_at).toLocaleDateString("es-CO", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
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
