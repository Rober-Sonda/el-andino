# apps/web

Capa de **presentación**: la SPA de React que ven los usuarios finales (tienda) y el panel de administración.

---

## 🎯 Responsabilidad de la capa

- Renderizar la interfaz de usuario (tienda, carrito, checkout, panel de admin).
- Manejar rutas (`react-router-dom`), autenticación (`AuthContext`) y estado del carrito (`CartContext`).
- Leer configuración desde variables de entorno (`VITE_*`) y exponer las instancias de Firebase (`src/firebase.js`).
- Llamar a `apps/functions` solo a través del SDK cliente de Firebase Functions (`httpsCallable`), nunca con API keys embebidas.

👉 Esta capa **no** debe contener secretos ni llamar directamente a APIs externas que requieran una key privada.

---

## 🧱 Estructura

```text
src/
├── assets/            → imágenes/íconos usados por componentes
├── components/        → componentes de UI (uno por feature)
├── context/            → AuthContext, CartContext (estado global)
├── test/setup.js       → setup de Vitest (matchers de jest-dom)
├── firebase.js         → bootstrap de Firebase (auth, db, functions)
├── App.jsx / main.jsx  → rutas y entrypoint
public/                 → assets estáticos servidos tal cual
```

---

## 🌍 Variables de entorno

Copiar `.env.example` a `.env` y completar con los valores del proyecto de Firebase:

```bash
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `VITE_FIREBASE_API_KEY` | API key web de Firebase (no es secreta, pero no debe hardcodearse) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Dominio de auth del proyecto |
| `VITE_FIREBASE_PROJECT_ID` | ID del proyecto Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de storage |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID de FCM |
| `VITE_FIREBASE_APP_ID` | App ID de Firebase |

---

## ▶️ Scripts

```bash
npm run dev          # servidor de desarrollo (Vite)
npm run build        # build de producción (dist/)
npm run preview       # sirve el build localmente
npm run lint          # eslint
npm run test          # vitest (una corrida)
npm run test:watch   # vitest en modo watch
```

---

## ✅ Testing

- Framework: **Vitest** + **@testing-library/react** + **jsdom**.
- Un archivo de test por componente/contexto relevante, junto al archivo original.
- Mockear `../firebase` y `firebase/firestore` en tests que usen `CartContext`/`AuthContext` para no inicializar Firebase real.

---

## 📌 Convenciones

- Constantes compartidas (ej. `ADMIN_EMAIL`) se importan de `@el-andino/shared-config`, nunca se hardcodean en un componente.
- Ningún componente debe hacer `fetch` directo a APIs externas con una API key en el cliente; eso vive en `apps/functions`.
