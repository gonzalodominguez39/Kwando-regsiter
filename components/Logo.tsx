/**
 * Logo de la escuela (Kwan-Do Taekwondo ITF).
 * Se sirve desde `public/` ya optimizado: 256×256 px y ~20 KB.
 */

import Image from "next/image";

export default function Logo({
  className,
  prioridad = false,
}: {
  className?: string;
  /** `true` para el logo que aparece arriba del todo (se carga antes). */
  prioridad?: boolean;
}) {
  return (
    <Image
      src="/kwan-do-logo.png"
      alt="Kwan-Do Taekwondo ITF"
      width={256}
      height={256}
      priority={prioridad}
      className={className}
    />
  );
}
