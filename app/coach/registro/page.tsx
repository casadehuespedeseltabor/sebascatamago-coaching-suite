"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegistroCoachPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
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
        data: { role: "coach", full_name: fullName, bio },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push("/pendiente-aprobacion");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-guadua-50 px-6 py-16">
      <div className="w-full max-w-md rounded-organico border border-guadua-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl text-musgo-900">Solicitar registro como coach</h1>
        <p className="mt-2 text-sm text-tinta/70">
          Tu cuenta quedará pendiente de aprobación por el administrador antes de
          que puedas invitar clientes.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Campo label="Nombre completo" value={fullName} onChange={setFullName} required />
          <Campo label="Correo" type="email" value={email} onChange={setEmail} required />
          <Campo
            label="Contraseña"
            type="password"
            value={password}
            onChange={setPassword}
            required
            minLength={8}
          />
          <label className="block text-sm">
            <span className="mb-1 block text-tinta/80">
              Breve descripción profesional (opcional)
            </span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-guadua-200 px-3 py-2 outline-none focus:border-rio"
            />
          </label>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-organico bg-guadua-500 py-2.5 font-medium text-white transition hover:bg-guadua-600 disabled:opacity-60"
          >
            {loading ? "Enviando…" : "Enviar solicitud"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Campo({
  label,
  type = "text",
  value,
  onChange,
  required,
  minLength,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-tinta/80">{label}</span>
      <input
        type={type}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-guadua-200 px-3 py-2 outline-none focus:border-rio"
      />
    </label>
  );
}
