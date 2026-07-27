"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Categoria = { name: string; score: number };
type RuedaResumen = { id: string; label: string; created_at: string };

const COLORES = ["#4e6b33", "#3f6b6d", "#84a561", "#a6bf87", "#658843"];

export default function LineaTiempoCategoria({
  ruedasOrdenadas,
  categoriasPorRueda,
}: {
  ruedasOrdenadas: RuedaResumen[];
  categoriasPorRueda: Record<string, Categoria[]>;
}) {
  const nombresCategorias = useMemo(() => {
    const set = new Set<string>();
    ruedasOrdenadas.forEach((r) => {
      (categoriasPorRueda[r.id] ?? []).forEach((c) => set.add(c.name));
    });
    return Array.from(set);
  }, [ruedasOrdenadas, categoriasPorRueda]);

  const [activas, setActivas] = useState<string[]>(nombresCategorias.slice(0, 3));

  const data = ruedasOrdenadas.map((r) => {
    const fila: Record<string, number | string> = {
      fecha: new Date(r.created_at).toLocaleDateString("es-CO", { month: "short", year: "2-digit" }),
    };
    (categoriasPorRueda[r.id] ?? []).forEach((c) => {
      fila[c.name] = c.score;
    });
    return fila;
  });

  return (
    <div className="rounded-organico border border-guadua-200 bg-white p-6">
      <h2 className="text-lg text-musgo-900">Evolución por categoría</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {nombresCategorias.map((n) => {
          const on = activas.includes(n);
          return (
            <button
              key={n}
              onClick={() =>
                setActivas((prev) => (on ? prev.filter((x) => x !== n) : [...prev, n]))
              }
              className={`rounded-full border px-3 py-1 text-xs transition ${
                on
                  ? "border-guadua-500 bg-guadua-500 text-white"
                  : "border-guadua-200 text-tinta/60"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e4ecda" />
          <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {activas.map((n, i) => (
            <Line
              key={n}
              type="monotone"
              dataKey={n}
              stroke={COLORES[i % COLORES.length]}
              strokeWidth={2}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
