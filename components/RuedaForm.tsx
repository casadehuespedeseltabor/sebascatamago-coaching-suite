"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { guardarRueda, type CategoriaInput } from "@/lib/actions";

const CATEGORIAS_SUGERIDAS = [
  "Salud",
  "Dinero / Finanzas",
  "Carrera / Trabajo",
  "Relación de pareja",
  "Familia y amigos",
  "Desarrollo personal",
  "Diversión y recreación",
  "Entorno físico",
  "Espiritualidad",
];

const MIN = 6;
const MAX = 12;

export default function RuedaForm() {
  const router = useRouter();
  const [seleccionadas, setSeleccionadas] = useState<CategoriaInput[]>([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleSugerida(name: string) {
    setSeleccionadas((prev) => {
      const existe = prev.find((c) => c.name === name);
      if (existe) return prev.filter((c) => c.name !== name);
      if (prev.length >= MAX) return prev;
      return [...prev, { name, score: 5, note: "" }];
    });
  }

  function agregarPersonalizada() {
    const nombre = nuevaCategoria.trim();
    if (!nombre) return;
    if (seleccionadas.length >= MAX) return;
    if (seleccionadas.some((c) => c.name.toLowerCase() === nombre.toLowerCase())) return;
    setSeleccionadas((prev) => [...prev, { name: nombre, score: 5, note: "" }]);
    setNuevaCategoria("");
  }

  function actualizar(name: string, campo: "score" | "note", valor: number | string) {
    setSeleccionadas((prev) =>
      prev.map((c) => (c.name === name ? { ...c, [campo]: valor } : c))
    );
  }

  function quitar(name: string) {
    setSeleccionadas((prev) => prev.filter((c) => c.name !== name));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (seleccionadas.length < MIN) {
      setError(`Elige al menos ${MIN} categorías (llevas ${seleccionadas.length}).`);
      return;
    }
    setLoading(true);
    try {
      const id = await guardarRueda(seleccionadas, "Rueda de la Vida");
      router.push(`/panel-cliente/rueda/${id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "No se pudo guardar la rueda.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-lg text-musgo-900">
          1. Elige tus categorías ({seleccionadas.length}/{MAX}, mínimo {MIN})
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIAS_SUGERIDAS.map((cat) => {
            const activa = seleccionadas.some((c) => c.name === cat);
            return (
              <button
                type="button"
                key={cat}
                onClick={() => toggleSugerida(cat)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  activa
                    ? "border-guadua-500 bg-guadua-500 text-white"
                    : "border-guadua-200 text-tinta/70 hover:border-guadua-400"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
            placeholder="Otra categoría personalizada…"
            className="flex-1 rounded-lg border border-guadua-200 px-3 py-2 text-sm outline-none focus:border-rio"
          />
          <button
            type="button"
            onClick={agregarPersonalizada}
            className="rounded-lg border border-guadua-400 px-4 py-2 text-sm font-medium text-guadua-700 hover:bg-guadua-50"
          >
            Agregar
          </button>
        </div>
      </div>

      {seleccionadas.length > 0 && (
        <div>
          <h2 className="text-lg text-musgo-900">2. Califica cada categoría (1–10)</h2>
          <div className="mt-4 space-y-5">
            {seleccionadas.map((c) => (
              <div key={c.name} className="rounded-organico border border-guadua-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-tinta">{c.name}</span>
                  <button
                    type="button"
                    onClick={() => quitar(c.name)}
                    className="text-xs text-tinta/50 underline hover:text-red-700"
                  >
                    quitar
                  </button>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={c.score}
                  onChange={(e) => actualizar(c.name, "score", Number(e.target.value))}
                  className="mt-3 w-full accent-guadua-500"
                />
                <div className="mt-1 text-sm text-guadua-700">Calificación: {c.score}</div>
                <textarea
                  placeholder="Nota opcional: ¿por qué elegiste este número? (privado, no editable después)"
                  value={c.note}
                  onChange={(e) => actualizar(c.name, "note", e.target.value)}
                  rows={2}
                  className="mt-2 w-full rounded-lg border border-guadua-200 px-3 py-2 text-sm outline-none focus:border-rio"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}

      <p className="text-xs text-tinta/50">
        Una vez guardada, esta rueda —calificaciones y notas— queda bloqueada
        para siempre. Ni tú, ni tu coach, ni el administrador podrán editarla.
      </p>

      <button
        type="submit"
        disabled={loading || seleccionadas.length < MIN}
        className="rounded-organico bg-guadua-500 px-6 py-2.5 font-medium text-white transition hover:bg-guadua-600 disabled:opacity-50"
      >
        {loading ? "Guardando…" : "Guardar mi Rueda de la Vida"}
      </button>
    </form>
  );
}
