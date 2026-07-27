"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

// ---------------------------------------------------------------------
// ADMIN
// ---------------------------------------------------------------------

export async function aprobarCoach(profileId: string) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  await supabase
    .from("coach_profiles")
    .update({ status: "approved", approved_at: new Date().toISOString(), approved_by: auth.user?.id })
    .eq("profile_id", profileId);
  revalidatePath("/admin");
}

export async function rechazarCoach(profileId: string) {
  const supabase = createClient();
  await supabase.from("coach_profiles").update({ status: "rejected" }).eq("profile_id", profileId);
  revalidatePath("/admin");
}

export async function eliminarCuenta(profileId: string) {
  const supabase = createClient();
  // Elimina la fila de perfil; el usuario de auth.users queda huérfano y
  // requiere borrado adicional desde el Dashboard de Supabase (Auth → Users)
  // porque las Server Actions usan la clave anónima, no la de servicio.
  await supabase.from("profiles").delete().eq("id", profileId);
  revalidatePath("/admin");
}

export async function eliminarRueda(wheelId: string) {
  const supabase = createClient();
  await supabase.from("wheels").delete().eq("id", wheelId);
  revalidatePath("/admin");
  revalidatePath("/panel-coach");
}

// ---------------------------------------------------------------------
// COACH
// ---------------------------------------------------------------------

export async function crearInvitacion(usosMax: number, diasValidez: number) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("No autenticado");

  const code = nanoid(10);
  const expires = new Date();
  expires.setDate(expires.getDate() + diasValidez);

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      code,
      coach_id: auth.user.id,
      max_uses: usosMax,
      expires_at: expires.toISOString(),
    })
    .select()
    .single();
  if (error) throw error;

  revalidatePath("/panel-coach");
  return data as {
    id: string;
    code: string;
    max_uses: number;
    uses_count: number;
    expires_at: string;
    revoked: boolean;
  };
}

export async function revocarInvitacion(id: string) {
  const supabase = createClient();
  await supabase.from("invitations").update({ revoked: true }).eq("id", id);
  revalidatePath("/panel-coach");
}

export async function habilitarNuevaRuedaParaCliente(clientId: string) {
  // En este MVP, "habilitar" una rueda no crea la fila (el cliente es quien
  // la diligencia), pero deja constancia disponible para que el coach lo
  // comunique manualmente. Si más adelante se agregan notificaciones
  // automáticas, este es el punto de extensión.
  revalidatePath(`/panel-coach/cliente/${clientId}`);
}

export async function agregarObservacion(wheelId: string, contenido: string) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("No autenticado");

  const { error } = await supabase.from("coach_observations").insert({
    wheel_id: wheelId,
    coach_id: auth.user.id,
    content: contenido,
  });
  if (error) throw error;
  revalidatePath(`/panel-coach`);
}

// ---------------------------------------------------------------------
// CLIENTE
// ---------------------------------------------------------------------

export type CategoriaInput = { name: string; score: number; note?: string };

export async function guardarRueda(categorias: CategoriaInput[], label: string) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("No autenticado");

  if (categorias.length < 6 || categorias.length > 12) {
    throw new Error("La rueda debe tener entre 6 y 12 categorías");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("coach_id")
    .eq("id", auth.user.id)
    .single();

  if (!profile?.coach_id) throw new Error("Tu cuenta no tiene un coach asignado");

  const { data: wheel, error: wheelError } = await supabase
    .from("wheels")
    .insert({ client_id: auth.user.id, coach_id: profile.coach_id, label })
    .select()
    .single();
  if (wheelError) throw wheelError;

  const rows = categorias.map((c, i) => ({
    wheel_id: wheel.id,
    name: c.name,
    score: c.score,
    note: c.note || null,
    position: i,
  }));

  const { error: catError } = await supabase.from("wheel_categories").insert(rows);
  if (catError) throw catError;

  revalidatePath("/panel-cliente");
  return wheel.id as string;
}

export async function cerrarSesion() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
