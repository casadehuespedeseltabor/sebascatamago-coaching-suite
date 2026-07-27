"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "admin") router.push("/admin");
    else if (profile?.role === "coach") router.push("/panel-coach");
    else if (profile?.role === "client") router.push("/panel-cliente");
    else router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-guadua-50 px-6">
      <div className="w-full max-w-sm rounded-organico border border-guadua-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl text-musgo-900">Iniciar sesión</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Campo label="Correo" type="email" value={email} onChange={setEmail} required />
          <Campo
            label="Contraseña"
            type="password"
            value={password}
            onChange={setPassword}
            required
          />
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-organico bg-guadua-500 py-2.5 font-medium text-white transition hover:bg-guadua-600 disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-tinta/70">
          ¿Eres coach y aún no tienes cuenta?{" "}
          <Link href="/coach/registro" className="text-rio underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </main>
  );
}

function Campo({
  label,
  type,
  value,
  onChange,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-tinta/80">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-guadua-200 px-3 py-2 outline-none focus:border-rio"
      />
    </label>
  );
}
