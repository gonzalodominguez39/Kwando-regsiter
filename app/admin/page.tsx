import Encabezado from "@/components/Encabezado";
import PanelAdmin from "@/components/admin/PanelAdmin";

/**
 * Panel de administración (ruta /admin).
 * Todo el control de acceso se resuelve en el cliente (login de Firebase Auth)
 * y en las reglas de Firestore, que sólo permiten leer al administrador.
 */
export default function AdminPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Encabezado
        titulo="Panel de administración"
        subtitulo="Gestión de alumnos del dojang"
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <PanelAdmin />
      </main>
    </div>
  );
}
