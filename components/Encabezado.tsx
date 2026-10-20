/**
 * Encabezado negro compartido por el formulario público y el panel de administración.
 * Es un Server Component: no necesita JavaScript en el cliente.
 */

import Logo from "./Logo";

export default function Encabezado({
  titulo,
  subtitulo,
}: {
  titulo: string;
  subtitulo?: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/92 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-3.5 sm:px-6 sm:py-4">
        <Logo
          prioridad
          className="h-12 w-12 shrink-0 drop-shadow-[0_0_18px_rgba(232,32,44,0.5)] sm:h-14 sm:w-14"
        />

        <div className="min-w-0 flex-1">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.28em] text-acento-texto sm:text-[0.65rem]">
            Kwan-Do · Taekwondo ITF
          </p>
          <h1 className="truncate text-lg font-bold leading-tight text-white sm:text-xl">
            {titulo}
          </h1>
          {subtitulo ? (
            <p className="mt-0.5 text-sm leading-snug text-humo sm:truncate">
              {subtitulo}
            </p>
          ) : null}
        </div>
      </div>

      {/* Filete rojo degradado que separa el header del contenido. */}
      <div className="h-px w-full bg-gradient-to-r from-acento via-acento/50 to-transparent" />
    </header>
  );
}
