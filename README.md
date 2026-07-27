# Sebascatamago Coaching Suite — Fase 1 (MVP)

Rueda de la Vida con 3 roles (Admin, Coach, Cliente), autenticación real,
historial con comparativas, observaciones de coach y exportación a PDF.

Stack: **Next.js 14 (App Router) + Supabase (Postgres + Auth) + Tailwind**.
Ambos con nivel gratuito. Sin pagos ni envío automático de correos (fuera de
alcance de esta fase, como se pidió).

---

## 0. Lo que vas a hacer (≈10-15 min, una sola vez)

1. Crear un proyecto en Supabase (gratis).
2. Pegar el esquema SQL en el editor de Supabase (crea tablas + seguridad).
3. Subir este código a GitHub y conectarlo a Vercel (gratis).
4. Crear tu propio usuario admin con 2 líneas de SQL.

Nada de esto requiere tarjeta de crédito.

---

## 1. Crear el proyecto en Supabase

1. Ve a https://supabase.com → **Start your project** → crea una cuenta.
2. **New project** → elige un nombre (ej. `sebascatamago`) y una contraseña
   de base de datos (guárdala, no la necesitarás de nuevo si no es
   necesario). Región: la más cercana a Colombia (ej. `South America` o
   `East US` si no aparece Sudamérica).
3. Espera ~2 minutos a que se aprovisione.
4. En el menú lateral: **SQL Editor** → **New query**.
5. Abre el archivo `supabase/schema.sql` de este proyecto, copia **todo** el
   contenido, pégalo en el editor y dale **Run**.
   - Este archivo crea las tablas, activa Row Level Security (RLS) en todas
     ellas, y define exactamente quién puede ver o modificar qué. Es el
     archivo que garantiza que un coach nunca vea los clientes de otro.
6. Ve a **Project Settings → API**. Copia:
   - **Project URL** → esto es `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → esto es `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Límites del nivel gratuito de Supabase (para saber cuándo escalar)

- 500 MB de base de datos, 1 GB de almacenamiento de archivos.
- 50,000 usuarios activos mensuales de autenticación.
- 2 proyectos gratuitos por organización.
- El proyecto se **pausa automáticamente tras 7 días sin uso** (se reactiva
  solo con la primera visita, pero tarda unos segundos). Para un MVP en
  validación esto rara vez es un problema; si empieza a serlo, es señal de
  que ya deberías considerar el plan Pro (USD 25/mes).
- Verifica los límites vigentes en https://supabase.com/pricing porque
  Supabase los ajusta con el tiempo.

## 3. Subir el código y desplegar en Vercel

1. Crea un repositorio nuevo en GitHub y sube el contenido de esta carpeta
   (sin `node_modules`, ya está excluido por `.gitignore`).
2. Ve a https://vercel.com → **Add New → Project** → importa ese repositorio.
3. En **Environment Variables**, agrega:
   - `NEXT_PUBLIC_SUPABASE_URL` = (el que copiaste en el paso 1)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (el que copiaste en el paso 1)
4. **Deploy**. En ~2 minutos tendrás una URL pública tipo
   `https://sebascatamago-coaching-suite.vercel.app`.

Límite gratuito de Vercel (plan Hobby): 100 GB de ancho de banda al mes y
despliegues ilimitados — de sobra para validar con usuarios reales.

## 4. Crear tu usuario administrador

El registro de administrador **no existe como formulario público** por
seguridad — se crea a mano, una sola vez:

1. En tu app ya desplegada, ve a `/coach/registro` y regístrate con tu
   propio correo (esto solo crea el usuario; quedará como coach "pendiente",
   lo vas a convertir en admin ahora mismo).
2. En Supabase → **SQL Editor**, ejecuta (reemplazando el correo):

```sql
update public.profiles set role = 'admin' where email = 'tu-correo@ejemplo.com';
delete from public.coach_profiles where profile_id = (select id from public.profiles where email = 'tu-correo@ejemplo.com');
```

3. Cierra sesión y vuelve a entrar en `/login` con ese correo. Ya verás el
   panel de administración en `/admin`.

## 5. Flujo de uso normal

- **Coach nuevo**: se registra en `/coach/registro` → queda pendiente → tú
  lo apruebas desde `/admin`.
- **Coach aprobado**: entra a `/panel-coach`, genera un link de invitación
  (con usos y días de validez configurables) y lo comparte manualmente por
  WhatsApp, correo, etc.
- **Cliente**: abre el link (`/invitacion/<código>`), se registra, y desde
  `/panel-cliente` diligencia su primera Rueda de la Vida.

## 6. Desarrollo local (opcional)

```bash
npm install
cp .env.example .env.local   # y pega ahí tus valores de Supabase
npm run dev
```

---

## Decisiones de seguridad importantes (no las cambies sin pensarlo dos veces)

- **Aislamiento entre coaches**: se garantiza con RLS en Postgres (ver
  `supabase/schema.sql`), no solo con lógica de frontend. Aunque alguien
  manipule las peticiones del navegador, la base de datos rechaza el acceso.
- **Inmutabilidad de las respuestas del cliente**: no existe política de
  `UPDATE` para `wheel_categories` ni `wheels` para ningún rol. Una vez
  guardada, una rueda es de solo lectura para siempre; solo se puede
  eliminar completa, y solo el admin puede hacerlo.
- **Invitaciones**: tienen expiración y límite de usos configurables, y se
  pueden revocar manualmente. Se validan en el servidor (trigger de
  Postgres), no en el navegador.
- **Cuentas admin**: no tienen registro público a propósito.

## Fuera de alcance en esta Fase 1 (dejado preparado, no implementado)

- Pagos y suscripciones automatizadas.
- Envío automático de correos (invitaciones, recordatorios mensuales).
- Soporte multi-idioma.

El esquema y el código están estructurados para que estas features se
agreguen después sin rehacer lo existente (ej. la tabla `invitations` ya
tiene todo lo necesario para conectar un envío automático de correo más
adelante).
