-- =========================================================================
-- SEBASCATAMAGO COACHING SUITE — ESQUEMA + ROW LEVEL SECURITY (RLS)
-- =========================================================================
-- Ejecuta este archivo completo en: Supabase Dashboard → SQL Editor → New query
-- Es idempotente (usa IF NOT EXISTS / OR REPLACE) para que puedas re-ejecutarlo.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. TABLAS
-- -------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'coach', 'client')),
  full_name text not null,
  email text not null,
  coach_id uuid references public.profiles(id) on delete set null, -- solo aplica a clientes
  created_at timestamptz not null default now()
);
comment on column public.profiles.coach_id is 'Solo se llena cuando role = client. Referencia al coach dueño de este cliente.';

create table if not exists public.coach_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  bio text,
  approved_at timestamptz,
  approved_by uuid references public.profiles(id)
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  coach_id uuid not null references public.profiles(id) on delete cascade,
  max_uses int not null default 1 check (max_uses > 0),
  uses_count int not null default 0,
  expires_at timestamptz not null default (now() + interval '14 days'),
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.wheels (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  coach_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Rueda de la Vida',
  created_at timestamptz not null default now()
);

create table if not exists public.wheel_categories (
  id uuid primary key default gen_random_uuid(),
  wheel_id uuid not null references public.wheels(id) on delete cascade,
  name text not null,
  score int not null check (score between 1 and 10),
  note text,
  position int not null default 0
);

create table if not exists public.coach_observations (
  id uuid primary key default gen_random_uuid(),
  wheel_id uuid not null references public.wheels(id) on delete cascade,
  coach_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- 2. FUNCIONES AUXILIARES (SECURITY DEFINER para evitar recursión en RLS)
-- -------------------------------------------------------------------------

create or replace function public.current_role_is(target_role text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = target_role
  );
$$;

create or replace function public.owns_client(check_client_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = check_client_id and coach_id = auth.uid()
  );
$$;

-- -------------------------------------------------------------------------
-- 3. TRIGGER: crear el perfil automáticamente cuando alguien se registra
-- -------------------------------------------------------------------------
-- El rol y (si aplica) el código de invitación se pasan en options.data al
-- llamar supabase.auth.signUp() desde el frontend. Este trigger valida el
-- código de invitación EN EL SERVIDOR — nunca confía en el frontend — y
-- rechaza el registro completo si el código no es válido, ya expiró, fue
-- revocado o agotó sus usos.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text := new.raw_user_meta_data->>'role';
  invite_code text := new.raw_user_meta_data->>'invite_code';
  inv record;
begin
  if requested_role = 'coach' then
    insert into public.profiles (id, role, full_name, email)
    values (new.id, 'coach', coalesce(new.raw_user_meta_data->>'full_name', ''), new.email);

    insert into public.coach_profiles (profile_id, status, bio)
    values (new.id, 'pending', new.raw_user_meta_data->>'bio');

  elsif requested_role = 'client' then
    if invite_code is null then
      raise exception 'Falta código de invitación';
    end if;

    select * into inv from public.invitations
      where code = invite_code
        and not revoked
        and expires_at > now()
        and uses_count < max_uses
      for update;

    if not found then
      raise exception 'Código de invitación inválido, expirado o agotado';
    end if;

    insert into public.profiles (id, role, full_name, email, coach_id)
    values (new.id, 'client', coalesce(new.raw_user_meta_data->>'full_name', ''), new.email, inv.coach_id);

    update public.invitations set uses_count = uses_count + 1 where id = inv.id;

  else
    raise exception 'Rol de registro no soportado. Las cuentas admin se crean manualmente.';
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------------------------------------------------------
-- 4. ACTIVAR RLS EN TODAS LAS TABLAS
-- -------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.coach_profiles enable row level security;
alter table public.invitations enable row level security;
alter table public.wheels enable row level security;
alter table public.wheel_categories enable row level security;
alter table public.coach_observations enable row level security;

-- -------------------------------------------------------------------------
-- 5. POLÍTICAS — profiles
-- -------------------------------------------------------------------------

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "profiles_select_admin_all" on public.profiles;
create policy "profiles_select_admin_all" on public.profiles
  for select using (public.current_role_is('admin'));

drop policy if exists "profiles_select_coach_own_clients" on public.profiles;
create policy "profiles_select_coach_own_clients" on public.profiles
  for select using (coach_id = auth.uid());

drop policy if exists "profiles_update_own_nonrole" on public.profiles;
create policy "profiles_update_own_nonrole" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());
  -- Nota: esta política permite editar la fila propia, pero el frontend NUNCA
  -- debe exponer un campo para cambiar `role` o `coach_id`. Para bloquearlo a
  -- nivel de base de datos también, ver trigger `prevent_role_escalation` abajo.

drop policy if exists "profiles_update_admin_all" on public.profiles;
create policy "profiles_update_admin_all" on public.profiles
  for update using (public.current_role_is('admin'));

drop policy if exists "profiles_delete_admin_only" on public.profiles;
create policy "profiles_delete_admin_only" on public.profiles
  for delete using (public.current_role_is('admin'));

-- Blindaje adicional: ningún usuario (excepto admin) puede cambiarse su propio rol o coach_id.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_role_is('admin') then
    return new;
  end if;
  if new.role <> old.role or coalesce(new.coach_id::text,'') <> coalesce(old.coach_id::text,'') then
    raise exception 'No autorizado para modificar rol o coach asignado';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_escalation on public.profiles;
create trigger trg_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- -------------------------------------------------------------------------
-- 6. POLÍTICAS — coach_profiles
-- -------------------------------------------------------------------------

drop policy if exists "coach_profiles_select_own" on public.coach_profiles;
create policy "coach_profiles_select_own" on public.coach_profiles
  for select using (profile_id = auth.uid());

drop policy if exists "coach_profiles_select_admin" on public.coach_profiles;
create policy "coach_profiles_select_admin" on public.coach_profiles
  for select using (public.current_role_is('admin'));

drop policy if exists "coach_profiles_update_admin" on public.coach_profiles;
create policy "coach_profiles_update_admin" on public.coach_profiles
  for update using (public.current_role_is('admin'));

-- -------------------------------------------------------------------------
-- 7. POLÍTICAS — invitations
-- -------------------------------------------------------------------------

drop policy if exists "invitations_all_own_coach" on public.invitations;
create policy "invitations_all_own_coach" on public.invitations
  for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());

drop policy if exists "invitations_select_admin" on public.invitations;
create policy "invitations_select_admin" on public.invitations
  for select using (public.current_role_is('admin'));

-- Nota importante: el código de invitación se valida por el TRIGGER
-- handle_new_user con permisos SECURITY DEFINER, así que un cliente anónimo
-- que se está registrando puede "gastar" un código sin tener sesión ni
-- permisos de lectura sobre esta tabla. No se necesita política pública.

-- -------------------------------------------------------------------------
-- 8. POLÍTICAS — wheels
-- -------------------------------------------------------------------------

drop policy if exists "wheels_select_own_client" on public.wheels;
create policy "wheels_select_own_client" on public.wheels
  for select using (client_id = auth.uid());

drop policy if exists "wheels_select_own_coach" on public.wheels;
create policy "wheels_select_own_coach" on public.wheels
  for select using (coach_id = auth.uid());

drop policy if exists "wheels_select_admin" on public.wheels;
create policy "wheels_select_admin" on public.wheels
  for select using (public.current_role_is('admin'));

-- Solo el propio cliente puede CREAR su rueda, y solo si el coach_id
-- coincide con su coach asignado (evita que registre ruedas contra otro coach).
drop policy if exists "wheels_insert_own_client" on public.wheels;
create policy "wheels_insert_own_client" on public.wheels
  for insert with check (
    client_id = auth.uid()
    and coach_id = (select coach_id from public.profiles where id = auth.uid())
  );

-- Nunca se otorga UPDATE a nadie: una rueda ya creada es inmutable en sus
-- metadatos base. Solo se permite DELETE, y solo al admin (regla explícita
-- del brief: "el admin sí puede eliminar una rueda, pero no modificarla").
drop policy if exists "wheels_delete_admin_only" on public.wheels;
create policy "wheels_delete_admin_only" on public.wheels
  for delete using (public.current_role_is('admin'));

-- -------------------------------------------------------------------------
-- 9. POLÍTICAS — wheel_categories
-- -------------------------------------------------------------------------

drop policy if exists "categories_select_own_client" on public.wheel_categories;
create policy "categories_select_own_client" on public.wheel_categories
  for select using (
    exists (select 1 from public.wheels w where w.id = wheel_id and w.client_id = auth.uid())
  );

drop policy if exists "categories_select_own_coach" on public.wheel_categories;
create policy "categories_select_own_coach" on public.wheel_categories
  for select using (
    exists (select 1 from public.wheels w where w.id = wheel_id and w.coach_id = auth.uid())
  );

drop policy if exists "categories_select_admin" on public.wheel_categories;
create policy "categories_select_admin" on public.wheel_categories
  for select using (public.current_role_is('admin'));

-- Solo se puede INSERTAR (al crear la rueda) por el cliente dueño. Sin
-- política de UPDATE para nadie => las calificaciones y notas quedan
-- bloqueadas para siempre una vez guardadas, incluido el propio cliente,
-- el coach y el admin. Esto es intencional (regla crítica del brief).
drop policy if exists "categories_insert_own_client" on public.wheel_categories;
create policy "categories_insert_own_client" on public.wheel_categories
  for insert with check (
    exists (select 1 from public.wheels w where w.id = wheel_id and w.client_id = auth.uid())
  );

-- El DELETE de categorías individuales no se expone; solo se borra la rueda
-- completa (cascade) vía la política de wheels_delete_admin_only.

-- -------------------------------------------------------------------------
-- 10. POLÍTICAS — coach_observations
-- -------------------------------------------------------------------------

drop policy if exists "observations_select_client" on public.coach_observations;
create policy "observations_select_client" on public.coach_observations
  for select using (
    exists (select 1 from public.wheels w where w.id = wheel_id and w.client_id = auth.uid())
  );

drop policy if exists "observations_select_coach" on public.coach_observations;
create policy "observations_select_coach" on public.coach_observations
  for select using (coach_id = auth.uid());

drop policy if exists "observations_select_admin" on public.coach_observations;
create policy "observations_select_admin" on public.coach_observations
  for select using (public.current_role_is('admin'));

drop policy if exists "observations_insert_own_coach" on public.coach_observations;
create policy "observations_insert_own_coach" on public.coach_observations
  for insert with check (
    coach_id = auth.uid()
    and exists (select 1 from public.wheels w where w.id = wheel_id and w.coach_id = auth.uid())
  );

-- -------------------------------------------------------------------------
-- 11. PRIMER ADMIN (ejecutar manualmente, una sola vez)
-- -------------------------------------------------------------------------
-- 1) Regístrate normalmente desde /coach/registro con tu correo (quedará
--    como coach "pending" — es solo para crear el usuario en auth.users).
-- 2) Luego, en el SQL Editor, ejecuta (reemplazando el correo):
--
--    update public.profiles set role = 'admin' where email = 'tu-correo@ejemplo.com';
--    delete from public.coach_profiles where profile_id = (select id from public.profiles where email = 'tu-correo@ejemplo.com');
--
-- Esto es intencional: no existe registro público de admin por seguridad.
