import type { NextConfig } from "next";

/**
 * La app es 100% cliente (el SDK de Firebase corre en el navegador y la
 * seguridad la aplican las reglas de Firestore), así que se puede publicar
 * como exportación estática en Firebase Hosting.
 *
 * - Modo servidor (por defecto): `npm run build && npm start`.
 * - Modo exportación estática: `npm run build:export` (define NEXT_OUTPUT=export)
 *   genera la carpeta `out/` que se sube a Firebase Hosting.
 */
const salidaEstatica = process.env.NEXT_OUTPUT === "export";

const nextConfig: NextConfig = {
  ...(salidaEstatica
    ? // La exportación estática no es compatible con PPR, y Cache Components
      // habilita PPR por defecto. En este modo el build es 100% estático.
      { output: "export" as const }
    : { cacheComponents: true, partialPrefetching: true }),

  // Con exportación estática se generan `admin/index.html` en lugar de
  // `admin.html`, que es lo que espera Firebase Hosting.
  trailingSlash: true,

  // El logo se sirve tal cual: la optimización de imágenes de Next no
  // funciona en la exportación estática y el PNG ya viene optimizado.
  images: {
    unoptimized: true,
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
