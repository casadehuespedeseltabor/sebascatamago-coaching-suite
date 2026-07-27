"use client";

import { useMemo, useState } from "react";
import RuedaRadar from "@/components/RuedaRadar";
import LineaTiempoCategoria from "@/components/LineaTiempoCategoria";
import { agregarObservacion } from "@/lib/actions";

type Categoria = { name: string; score: number; note: string | null };
type Observacion = { id: string; wheel_id: string; content: string; created_at: string };
type Rueda = { id: string; label: string; created_at: string };

export default function PanelCoachClienteDetalle({
  ruedas,
  categoriasPorRueda,
  observaciones,
}: {
  ruedas: Rueda[];
  categoriasPorRueda: Record<string, Categoria[]>;
  observaciones: Observacion[];
}) {
  const [seleccionada, setSeleccionada] = useState<string>(ruedas[0]?.id ?? "");
  const [compararCon, setCompararCon] = useState<string>("");
  const [texto, setTexto] = useState("");
  const [obsLocales, setObsLocales] = useState(observaciones);
  const [enviando, setEnviando] = useState(false);

  const categorias = categoriasPorRueda[seleccionada] ?? [];
  const comparacion = compararCon ? categoriasPorRueda[compararCon] : undefined;
  const obsDeEstaRueda = obsLocales.filter((o) => o.wheel_id === seleccionada);
  const otras = ruedas.filter((r) => r.id !== seleccionada);

  const ruedaActual = useMemo(() => ruedas.find((r) => r.id === seleccionada), [ruedas, seleccionada]);

  async function enviarObservacion() {
    if (!texto.trim()) return;
    setEnviando(true);
    await agregarObservacion(seleccionada, texto.trim());
    setObsLocales((prev) => [
      ...prev,
      { id: crypto.randomUUID(), wheel_id: seleccionada, content: texto.trim(), created_at: new Date().toISOString() },
    ]);
    setTexto("");
    setEnviando(false);
  }

  if (ruedas.length === 0) {
    return <p className="text-sm text-tinta/60">Este cliente aún no ha diligenciado ninguna rueda.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">
          <span className="mr-2 text-tinta/70">Ver rueda:</span>
          <select
            value={seleccionada}
            onChange={(e) => {
              setSeleccionada(e.target.value);
              setCompararCon("");
            }}
            className="rounded-lg border border-guadua-200 px-2 py-1"
          >
            {ruedas.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label} · {new Date(r.created_at).toLocaleDateString("es-CO")}
              </option>
            ))}
          </select>
        </label>
        {otras.length > 0 && (
          <label className="text-sm">
            <span className="mr-2 text-tinta/70">Comparar con:</span>
            <select
              value={compararCon}
              onChange={(e) => setCompararCon(e.target.value)}
              className="rounded-lg border border-guadua-200 px-2 py-1"
            >
              <option value="">— ninguna —</option>
              {otras.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label} · {new Date(r.created_at).toLocaleDateString("es-CO")}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="rounded-organico border border-guadua-200 bg-white p-6">
        <RuedaRadar
          principal={categorias}
          etiquetaPrincipal={ruedaActual?.label ?? "Actual"}
          comparacion={comparacion}
          etiquetaComparacion={ruedas.find((r) => r.id === compararCon)?.label}
        />
        <div className="mt-6 space-y-3">
          {categorias.map((c) => (
            <div key={c.name} className="border-l-2 border-guadua-200 pl-4">
              <p className="font-medium text-tinta">
                {c.name} — <span className="text-guadua-700">{c.score}/10</span>
              </p>
              {c.note && <p className="mt-1 text-sm text-tinta/70">{c.note}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-organico border border-guadua-200 bg-white p-6">
        <h2 className="text-sm font-medium text-musgo-900">Tus observaciones sobre esta rueda</h2>
        <ul className="mt-2 space-y-2">
          {obsDeEstaRueda.map((o) => (
            <li key={o.id} className="text-sm text-tinta/80">
              {o.content}
              <span className="ml-2 text-xs text-tinta/40">
                {new Date(o.created_at).toLocaleDateString("es-CO")}
              </span>
            </li>
          ))}
        </ul>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          placeholder="Escribe una observación visible para tu cliente…"
          className="mt-3 w-full rounded-lg border border-guadua-200 px-3 py-2 text-sm outline-none focus:border-rio"
        />
        <button
          onClick={enviarObservacion}
          disabled={enviando || !texto.trim()}
          className="mt-2 rounded-organico bg-guadua-500 px-5 py-2 text-sm font-medium text-white hover:bg-guadua-600 disabled:opacity-50"
        >
          {enviando ? "Guardando…" : "Guardar observación"}
        </button>
      </div>

      {ruedas.length > 1 && (
        <LineaTiempoCategoria ruedasOrdenadas={[...ruedas].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())} categoriasPorRueda={categoriasPorRueda} />
      )}
    </div>
  );
}
