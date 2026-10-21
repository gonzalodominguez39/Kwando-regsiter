/**
 * Indicador de carga giratorio.
 *
 * Componente compartido por el formulario público, el login y el panel de
 * administración, para que el indicador se vea igual en todos lados.
 * No necesita estado, así que se puede usar tanto en el servidor como en el
 * cliente.
 */

/** Tamaños disponibles del spinner. */
type Tamano = "sm" | "md" | "lg";

const CLASES_POR_TAMANO: Record<Tamano, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-8 w-8",
};

export default function Spinner({
  tamano = "md",
  className = "",
}: {
  /** Tamaño del indicador. */
  tamano?: Tamano;
  /** Clases extra (por ejemplo, para cambiar el color). */
  className?: string;
}) {
  return (
    <svg
      className={`${CLASES_POR_TAMANO[tamano]} animate-spin ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  );
}
