/**
 * Ficha del Sabonim (instructor jefe) que acompaña al formulario.
 * Foto arriba y nombre y rango debajo.
 */

import Image from "next/image";

export default function Sabonim() {
  return (
    <aside className="mx-auto w-full max-w-xs lg:max-w-none">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/60 backdrop-blur-sm">
        <div className="relative">
          <Image
            src="/Sabonim.webp"
            alt="Sabonim Esteban Gabriel Contardi, VI Dan"
            width={716}
            height={489}
            className="aspect-[3/2] w-full object-cover object-top"
          />
          {/* Filete dorado entre la foto y los datos. */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-yellow-200 to-transparent" />
        </div>

        <div className="px-5 py-4 text-center">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.25em] text-amber-300">
            Sabonim
          </p>
          <p className="mt-1 text-base font-bold leading-snug text-white">
            Esteban Gabriel Contardi
          </p>
          <p className="text-sm text-humo">VI DAN ITF AR-6-177</p>
          <p className="text-sm text-humo">KW-02</p>
        </div>
      </div>
    </aside>
  );
}
