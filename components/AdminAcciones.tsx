"use client";

import { useState, useTransition } from "react";
import { aprobarCoach, rechazarCoach, eliminarCuenta, eliminarRueda } from "@/lib/actions";

export function BotonesCoachPendiente({ profileId }: { profileId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex gap-3 text-sm">
      <button
        onClick={() => startTransition(() => aprobarCoach(profileId))}
        disabled={pending}
        className="rounded-lg bg-guadua-500 px-3 py-1 text-white hover:bg-guadua-600 disabled:opacity-50"
      >
        Aprobar
      </button>
      <button
        onClick={() => startTransition(() => rechazarCoach(profileId))}
        disabled={pending}
        className="rounded-lg border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        Rechazar
      </button>
    </div>
  );
}

export function BotonEliminarRueda({ wheelId }: { wheelId: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirmando) {
    return (
      <button
        onClick={() => setConfirmando(true)}
        className="text-xs text-tinta/40 underline hover:text-red-700"
      >
        eliminar
      </button>
    );
  }

  return (
    <span className="text-xs">
      ¿Eliminar esta rueda?{" "}
      <button
        disabled={pending}
        onClick={() => startTransition(() => eliminarRueda(wheelId))}
        className="text-red-700 underline"
      >
        sí
      </button>{" "}
      ·{" "}
      <button onClick={() => setConfirmando(false)} className="text-tinta/50 underline">
        no
      </button>
    </span>
  );
}

export function BotonEliminarCuenta({ profileId, nombre }: { profileId: string; nombre: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirmando) {
    return (
      <button
        onClick={() => setConfirmando(true)}
        className="text-xs text-tinta/40 underline hover:text-red-700"
      >
        eliminar cuenta
      </button>
    );
  }

  return (
    <span className="text-xs">
      ¿Eliminar a {nombre}?{" "}
      <button
        disabled={pending}
        onClick={() => startTransition(() => eliminarCuenta(profileId))}
        className="text-red-700 underline"
      >
        sí, eliminar
      </button>{" "}
      ·{" "}
      <button onClick={() => setConfirmando(false)} className="text-tinta/50 underline">
        cancelar
      </button>
    </span>
  );
}
