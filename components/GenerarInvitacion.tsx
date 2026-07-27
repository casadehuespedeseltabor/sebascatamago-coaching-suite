"use client";

import { useState } from "react";
import { crearInvitacion, revocarInvitacion } from "@/lib/actions";

type Invitacion = {
  id: string;
  code: string;
  max_uses: number;
  uses_count: number;
  expires_at: string;
  revoked: boolean;
};

export default function GenerarInvitacion({
  invitacionesIniciales,
  origenUrl,
}: {
  invitacionesIniciales: Invitacion[];
  origenUrl: string;
}) {
  const [invitaciones, setInvitaciones] = useState(invitacionesIniciales);
  const [usos, setUsos] = useState(1);
  const [dias, setDias] = useState(14);
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);

  async function generar() {
    setLoading(true);
    const nueva = await crearInvitacion(usos, dias);
    setInvitaciones((prev) => [nueva, ...prev]);
    setLoading(false);
  }

  function copiar(code: string) {
    const url = `${origenUrl}/invitacion/${code}`;
    navigator.clipboard.writeText(url);
    setCopiado(code);
    setTimeout(() => setCopiado(null), 1500);
  }

  return (
    <div className="rounded-organico border border-guadua-200 bg-white p-6">
      <h2 className="text-lg text-musgo-900">Invitar a un nuevo cliente</h2>
      <div className="mt-3 flex flex-wrap items-end gap-4">
        <label className="text-sm">
          <span className="mb-1 block text-tinta/70">Usos permitidos</span>
          <input
            type="number"
            min={1}
            value={usos}
            onChange={(e) => setUsos(Number(e.target.value))}
            className="w-20 rounded-lg border border-guadua-200 px-2 py-1"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-tinta/70">Válido por (días)</span>
          <input
            type="number"
            min={1}
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
            className="w-20 rounded-lg border border-guadua-200 px-2 py-1"
          />
        </label>
        <button
          onClick={generar}
          disabled={loading}
          className="rounded-organico bg-guadua-500 px-5 py-2 text-sm font-medium text-white hover:bg-guadua-600 disabled:opacity-50"
        >
          {loading ? "Generando…" : "Generar link"}
        </button>
      </div>

      {invitaciones.length > 0 && (
        <ul className="mt-6 space-y-2">
          {invitaciones.map((inv) => {
            const vencida = new Date(inv.expires_at) < new Date();
            const agotada = inv.uses_count >= inv.max_uses;
            const inactiva = inv.revoked || vencida || agotada;
            return (
              <li
                key={inv.id}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
                  inactiva ? "border-guadua-100 text-tinta/40" : "border-guadua-200"
                }`}
              >
                <code className="font-mono">{inv.code}</code>
                <span>
                  {inv.uses_count}/{inv.max_uses} usos ·{" "}
                  {inactiva
                    ? inv.revoked
                      ? "revocada"
                      : agotada
                      ? "agotada"
                      : "vencida"
                    : `vence ${new Date(inv.expires_at).toLocaleDateString("es-CO")}`}
                </span>
                <div className="flex gap-3">
                  {!inactiva && (
                    <>
                      <button onClick={() => copiar(inv.code)} className="text-rio underline">
                        {copiado === inv.code ? "¡copiado!" : "copiar link"}
                      </button>
                      <button
                        onClick={async () => {
                          await revocarInvitacion(inv.id);
                          setInvitaciones((prev) =>
                            prev.map((i) => (i.id === inv.id ? { ...i, revoked: true } : i))
                          );
                        }}
                        className="text-tinta/50 underline hover:text-red-700"
                      >
                        revocar
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
