import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-musgo-900 text-bruma">
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.14]"
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {[80, 210, 340, 470, 600, 730].map((x, i) => (
            <g key={x}>
              <line x1={x} y1="0" x2={x} y2="600" stroke="#e4ecda" strokeWidth="3" />
              {[90, 220, 350, 480].map((y) => (
                <circle key={y} cx={x} cy={y} r="5" fill="#e4ecda" />
              ))}
            </g>
          ))}
        </svg>
        <div className="relative mx-auto max-w-5xl px-6 py-28 sm:py-36">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-guadua-300">
            Cada nodo, una medición · cada medición, un paso
          </p>
          <h1 className="max-w-3xl text-5xl leading-[1.05] sm:text-6xl">
            La Rueda de la Vida, tan disciplinada como crece la guadua.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-guadua-100">
            Sebascatamago Coaching Suite ayuda a coaches a medir, con sus clientes,
            la evolución real del proceso — mes a mes, categoría por categoría —
            sin depender de una hoja de cálculo dispersa.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/coach/registro"
              className="rounded-organico bg-guadua-400 px-7 py-3 font-medium text-musgo-900 transition hover:bg-guadua-300"
            >
              Solicitar registro como coach
            </Link>
            <Link
              href="/login"
              className="rounded-organico border border-guadua-400/60 px-7 py-3 font-medium text-bruma transition hover:border-guadua-200"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-3xl text-musgo-900">Un nodo por cada evaluación</h2>
        <p className="mt-3 max-w-2xl text-tinta/80">
          Así como la guadua marca su crecimiento en nodos visibles, cada rueda
          completada queda como un punto fijo en la línea de tiempo de tu cliente.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          <Beneficio
            titulo="Historial que no se pierde"
            texto="Cada cliente ve su propia evolución categoría por categoría, mes a mes, sin depender de capturas de pantalla ni PDFs sueltos."
          />
          <Beneficio
            titulo="Tus clientes, solo tuyos"
            texto="Cada coach ve únicamente a sus propios clientes. Las respuestas de cada persona quedan bloqueadas una vez guardadas — ni tú ni el administrador pueden alterarlas."
          />
          <Beneficio
            titulo="Invitación sin fricción"
            texto="Generas un link de invitación y lo compartes por el canal que prefieras. Sin automatizaciones innecesarias en esta primera fase."
          />
        </div>
      </section>

      <footer className="border-t border-guadua-200 bg-guadua-50 py-8 text-center text-sm text-tinta/60">
        Sebascatamago Coaching Suite — Fase 1 (MVP)
      </footer>
    </main>
  );
}

function Beneficio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="border-l-2 border-guadua-300 pl-5">
      <h3 className="text-xl text-musgo-900">{titulo}</h3>
      <p className="mt-2 text-sm leading-relaxed text-tinta/75">{texto}</p>
    </div>
  );
}
