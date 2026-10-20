/**
 * Pie de página con el logo de la escuela y un link al panel de administración.
 */

import Link from "next/link";
import Logo from "./Logo";

/**
 * Año actual. Se calcula una sola vez al cargar el módulo (y no durante el
 * render) para que Next.js lo pueda prerenderizar sin problemas.
 */
const ANIO = new Date().getFullYear();

export default function PieDePagina() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-black/40">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-4 py-6 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
        <div className="flex items-center gap-3">
          <Logo className="h-9 w-9 opacity-80" />
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-white">
              Kwan-Do
            </p>
            <p className="text-xs text-humo-2">
              © {ANIO} Taekwondo ITF — Todos los derechos reservados.
            </p>
          </div>
        </div>

        <Link
          href="/admin"
          className="text-xs font-medium text-humo underline underline-offset-4 transition-colors hover:text-acento-texto"
        >
          Acceso del administrador
        </Link>
      </div>
    </footer>
  );
}
