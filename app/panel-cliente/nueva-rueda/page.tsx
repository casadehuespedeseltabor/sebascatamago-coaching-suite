import Link from "next/link";
import RuedaForm from "@/components/RuedaForm";

export default function NuevaRuedaPage() {
  return (
    <main className="min-h-screen bg-guadua-50 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/panel-cliente" className="text-sm text-rio underline">
          ← Volver
        </Link>
        <h1 className="mt-4 text-2xl text-musgo-900">Nueva Rueda de la Vida</h1>
        <p className="mt-2 text-sm text-tinta/70">
          Tómate tu tiempo. No hay respuestas correctas, solo tu percepción de
          hoy.
        </p>
        <div className="mt-8">
          <RuedaForm />
        </div>
      </div>
    </main>
  );
}
