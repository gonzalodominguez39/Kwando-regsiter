import Encabezado from "@/components/Encabezado";
import FormularioAlumno from "@/components/FormularioAlumno";
import PieDePagina from "@/components/PieDePagina";
import Sabonim from "@/components/Sabonim";

/**
 * Página pública del formulario de inscripción.
 * Es un Server Component: sólo renderiza el HTML inicial y el formulario
 * interactivo se hidrata en el cliente.
 *
 * En pantallas grandes el formulario va a la izquierda y la ficha del
 * Sabonim a la derecha; en el celular se apilan (sabonim arriba).
 */
export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Encabezado
        titulo="Registro de alumnos"
        subtitulo="Completá tus datos para inscribirte en el dojang"
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-7 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-acento-texto">
            Inscripción
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Sumate al dojang
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-humo">
            Todos los campos son obligatorios. Si sos menor de 18 años te vamos a
            pedir también los datos de tu padre, madre o tutor.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:gap-8">
          {/* Ficha del instructor: arriba en el celular, a la derecha en desktop. */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-28">
            <Sabonim />
          </div>

          <div className="order-2 lg:order-1">
            <FormularioAlumno />
          </div>
        </div>
      </main>

      <PieDePagina />
    </div>
  );
}
