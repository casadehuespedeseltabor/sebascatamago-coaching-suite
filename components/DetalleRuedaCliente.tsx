"use client";

import { useMemo, useState } from "react";
import RuedaRadar from "@/components/RuedaRadar";
import ExportarPDFBoton from "@/components/ExportarPDFBoton";
import LineaTiempoCategoria from "@/components/LineaTiempoCategoria";

type Categoria = { name: string; score: number; note: string | null };
type Observacion = { id: string; content: string; created_at: string };
type RuedaResumen = { id: string; label: string; created_at: string };

export default function DetalleRuedaCliente({
  ruedaId,
  label,
  fecha,
  categorias,
  observaciones,
  otrasRuedas,
  categoriasPorRueda,
  nombreParaArchivo,
}: {
  ruedaId: string;
  label: string;
  fecha: string;
  categorias: Categoria[];
  observaciones: Observacion[];
  otrasRuedas: RuedaResumen[];
  categoriasPorRueda: Record<string, Categoria[]>;
  nombreParaArchivo: string;
}) {
  const [compararCon, setCompararCon] = useState<string>("");

  const comparacion = useMemo(
    () => (compararCon ? categoriasPorRueda[compararCon] : undefined),
    [compararCon, categoriasPorRueda]
  );

  return (
    <div className="space-y-8">
      <div id={`export-${ruedaId}`} className="rounded-organico border border-guadua-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl text-musgo-900">{label}</h1>
            <p className="text-sm text-tinta/60">
              {new Date(fecha).toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          {otrasRuedas.length > 0 && (
            <label className="text-sm">
              <span className="mr-2 text-tinta/70">Comparar con:</span>
              <select
                value={compararCon}
                onChange={(e) => setCompararCon(e.target.value)}
                className="rounded-lg border border-guadua-200 px-2 py-1"
              >
                <option value="">— ninguna —</option>
                {otrasRuedas.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label} · {new Date(r.created_at).toLocaleDateString("es-CO")}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <RuedaRadar
          principal={categorias}
          etiquetaPrincipal={label}
          comparacion={comparacion}
          etiquetaComparacion={
            compararCon ? otrasRuedas.find((r) => r.id === compararCon)?.label : undefined
          }
        />

        <div className="mt-6 space-y-4">
          {categorias.map((c) => (
            <div key={c.name} className="border-l-2 border-guadua-200 pl-4">
              <p className="font-medium text-tinta">
                {c.name} — <span className="text-guadua-700">{c.score}/10</span>
              </p>
              {c.note && <p className="mt-1 text-sm text-tinta/70">{c.note}</p>}
            </div>
          ))}
        </div>

        {observaciones.length > 0 && (
          <div className="mt-8 rounded-organico bg-guadua-50 p-4">
            <h2 className="text-sm font-medium text-musgo-900">
              Observaciones de tu coach
            </h2>
            <ul className="mt-2 space-y-3">
              {observaciones.map((o) => (
                <li key={o.id} className="text-sm text-tinta/80">
                  <p>{o.content}</p>
                  <p className="mt-1 text-xs text-tinta/40">
                    {new Date(o.created_at).toLocaleDateString("es-CO")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <ExportarPDFBoton targetId={`export-${ruedaId}`} nombreArchivo={nombreParaArchivo} />

      {otrasRuedas.length > 0 && (
        <LineaTiempoCategoria
          ruedasOrdenadas={[
            ...otrasRuedas,
            { id: ruedaId, label, created_at: fecha },
          ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())}
          categoriasPorRueda={{ ...categoriasPorRueda, [ruedaId]: categorias }}
        />
      )}
    </div>
  );
}
