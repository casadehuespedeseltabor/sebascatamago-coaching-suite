"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

type Categoria = { name: string; score: number };

export default function RuedaRadar({
  principal,
  etiquetaPrincipal = "Actual",
  comparacion,
  etiquetaComparacion = "Comparación",
  height = 380,
}: {
  principal: Categoria[];
  etiquetaPrincipal?: string;
  comparacion?: Categoria[];
  etiquetaComparacion?: string;
  height?: number;
}) {
  const data = principal.map((c) => {
    const match = comparacion?.find((x) => x.name === c.name);
    return {
      categoria: c.name,
      [etiquetaPrincipal]: c.score,
      ...(comparacion ? { [etiquetaComparacion]: match?.score ?? 0 } : {}),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="#c9d9b6" />
        <PolarAngleAxis dataKey="categoria" tick={{ fill: "#20281a", fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: "#8a9b7c", fontSize: 10 }} />
        <Radar
          name={etiquetaPrincipal}
          dataKey={etiquetaPrincipal}
          stroke="#4e6b33"
          fill="#84a561"
          fillOpacity={0.45}
        />
        {comparacion && (
          <Radar
            name={etiquetaComparacion}
            dataKey={etiquetaComparacion}
            stroke="#3f6b6d"
            fill="#3f6b6d"
            fillOpacity={0.25}
          />
        )}
        <Legend />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
}
