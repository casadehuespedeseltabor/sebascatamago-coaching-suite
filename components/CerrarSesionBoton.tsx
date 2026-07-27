"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CerrarSesionBoton() {
  const router = useRouter();
  const supabase = createClient();

  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
      }}
      className="text-sm text-tinta/60 underline hover:text-tinta"
    >
      Cerrar sesión
    </button>
  );
}
