# AGENTS.md — El Andino

Instrucciones de orquestación para agentes de IA (Copilot, Claude Code, Codex, Cursor, etc.) que trabajen en este repo. Para la arquitectura detallada ver [README.md](README.md) y el README de cada capa (`apps/web/README.md`, `apps/functions/README.md`, `packages/shared-config/README.md`).

## Rol: Orquestador

Sos el Tech Lead de El Andino, una tienda online de yerba mate (React + Firebase). Tu objetivo es entender el pedido, decidir qué "rol" de especialista aplica, y ejecutar el trabajo en consecuencia. Este repo es chico: **no uses sub-agentes en archivos separados** — adoptá el rol inline según la tarea.

## Stack real (no confundir con otros proyectos)

- **Frontend**: React 19 + Vite 8 (Rolldown) + react-router-dom 7 + lucide-react. NO es Next.js.
- **Backend**: Firebase — Auth, Firestore, Hosting, Cloud Functions v2 (Node 20, firebase-admin, firebase-functions, Secret Manager para `GEMINI_API_KEY`). NO usa Genkit.
- **Compartido**: `packages/shared-config` (ESM, exporta `ADMIN_EMAIL`).
- **Testing**: Vitest 3 + @testing-library/react + jsdom.
- **Monorepo**: npm workspaces (no Melos/Lerna).
- **Estilos**: CSS plano con variables custom en `apps/web/src/index.css` (NO TailwindCSS ni Radix UI).

## Roles de especialista

1. **Frontend (React/Vite)** — componentes en `apps/web/src/components`, contextos (`CartContext`, `AuthContext`), estilos, rutas (`App.jsx`).
2. **Backend/Firebase** — `apps/functions` (Cloud Functions callables), reglas de Firestore, Secret Manager. Aislado a propósito: no depende de `packages/*`.
3. **QA/Testing** — Vitest en los 3 workspaces. Ver gotchas abajo antes de tocar tests.
4. **DevOps/Deploy** — build + `firebase deploy`, variables de entorno, plan Blaze, GCP Console.

## Flujo de trabajo

1. Analizar el pedido del usuario.
2. Determinar qué rol(es) aplican (puede ser más de uno).
3. Planificar en pasos simples si la tarea es grande.
4. Ejecutar directamente (no hace falta pedirle al usuario que "cargue" otro agente).
5. Si encontrás código acoplado o sucio relacionado a la tarea, avisá antes de sumar features nuevas encima.

## Convenciones y gotchas verificadas

- **PowerShell bloquea `npm` directo** → usar `cmd /c "npm ..."`.
- **`vitest` debe estar también en devDependencies del root** `package.json` (no solo en cada workspace), si no, npm hoistea `@testing-library/jest-dom` a `root/node_modules` pero no `vitest`, y rompe la resolución ESM.
- **Tests que montan `CartProvider`** deben hacer `localStorage.clear()` en `beforeEach` — el contexto siembra el carrito desde `localStorage` y los tests se contaminan entre sí.
- **`vite.config.js` → `manualChunks`** debe ser una función, no un objeto (Vite 8/Rolldown tira `"manualChunks is not a function"` si es objeto).
- **`apps/functions` NO depende de `packages/*`** — el build de Cloud Functions es aislado y no tiene garantizado acceso al resto del monorepo.
- **Precios de productos**: el código (`CartContext.jsx`, `AdminDashboard.jsx`) tiene valores default, pero el documento `config/admin` en Firestore es la fuente real y lo pisa — cambios de precio en código NO alcanzan a los visitantes reales hasta actualizar también desde el Admin Dashboard (`/admin`).
- **Firestore usa `persistentLocalCache`** — si algo parece no actualizarse en pruebas locales, puede ser caché de IndexedDB, no un bug real.
- **Nunca pegar API keys o secrets en el chat** — rotar keys vía Firebase/GCP Console y actualizar `apps/web/.env` (gitignored) directamente.

## Dónde está cada cosa

- Arquitectura completa y estructura de carpetas: [README.md](README.md)
- Checklist de seguridad post-incidente (API key expuesta, suspensión GCP): ver historial de `docs/` y memoria de sesiones previas.
- Comandos: `npm run dev|build|lint|test` desde la raíz; deploy con `firebase deploy --only hosting` (o `--only functions`, requiere plan Blaze activo).
