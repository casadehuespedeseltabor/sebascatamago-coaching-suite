"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function InvitacionPage() {
  const { codigo } = useParams<{ codigo: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "client", full_name: fullName, invite_code: codigo },
      },
    });

    if (signUpError) {
      // Mostramos el mensaje real de Supabase (en MVP/pruebas esto ayuda a
      // diagnosticar rápido; el trigger de la base de datos ya traduce los
      // casos de código inválido/expirado/agotado a español).
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push("/panel-cliente");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-guadua-50 px-6 py-16">
      <div className="w-full max-w-md rounded-organico border border-guadua-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl text-musgo-900">Crea tu cuenta</h1>
        <p className="mt-2 text-sm text-tinta/70">
          Estás aceptando una invitación de tu coach para comenzar a registrar tu
          Rueda de la Vida.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-tinta/80">Nombre completo</span>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-guadua-200 px-3 py-2 outline-none focus:border-rio"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-tinta/80">Correo</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-guadua-200 px-3 py-2 outline-none focus:border-rio"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-tinta/80">Contraseña</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-guadua-200 px-3 py-2 outline-none focus:border-rio"
            />
          </label>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-organico bg-guadua-500 py-2.5 font-medium text-white transition hover:bg-guadua-600 disabled:opacity-60"
          >
            {loading ? "Creando cuenta…" : "Crear cuenta y empezar"}
          </button>
        </form>
      </div>
    </main>
  );
}
