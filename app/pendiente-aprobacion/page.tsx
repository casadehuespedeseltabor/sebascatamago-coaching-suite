export default function PendienteAprobacionPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-guadua-50 px-6 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl text-musgo-900">Ya casi</h1>
        <p className="mt-3 text-tinta/75">
          Te acabamos de enviar un correo de confirmación. Ábrelo y haz clic
          en el enlace para verificar tu cuenta.
        </p>
        <p className="mt-3 text-tinta/75">
          Una vez confirmado el correo, tu solicitud queda pendiente de
          aprobación por el administrador. Podrás iniciar sesión con acceso
          completo cuando sea aprobada.
        </p>
        <p className="mt-6 text-sm text-tinta/50">
          ¿No te llegó el correo? Revisa la carpeta de spam. Si ya pasaron
          varios minutos, intenta iniciar sesión — si tu cuenta ya fue
          confirmada, volverás a ver este mismo mensaje hasta que el
          administrador la apruebe.
        </p>
      </div>
    </main>
  );
}
