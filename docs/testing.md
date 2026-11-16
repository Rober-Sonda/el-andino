# Testing

Este repo usa **Vitest** en todos los workspaces (`apps/web`, `apps/functions`, `packages/shared-config`).

## Cómo correr los tests

```bash
npm run test                           # todos los workspaces
npm run test --workspace=@el-andino/web
npm run test --workspace=@el-andino/functions
```

## Convenciones

- Un archivo de test junto al archivo que prueba: `Foo.jsx` → `Foo.test.jsx`, `index.js` → `index.test.js`.
- `apps/web`: usar `@testing-library/react` para componentes; mockear `../firebase` y `firebase/firestore`/`firebase/auth` en todo test que importe un contexto que inicialice Firebase.
- `apps/functions`: extraer la lógica de autorización/validación/llamadas externas como funciones puras exportadas (ver `assertAuthorized`, `assertValidRequest`, `callGemini` en `apps/functions/index.js`) para poder testearlas sin desplegar ni llamar a APIs reales. Mockear `global.fetch`.
- No se requiere cobertura 100%, pero **toda lógica nueva con reglas de negocio** (validaciones, cálculos de precio, autorización, parsers) debe tener al menos un test que cubra el caso feliz y un caso de error/edge.

## Checklist para nuevas features

1. ¿Agrega una regla de negocio o validación? → agregar test.
2. ¿Toca `ADMIN_EMAIL` o constantes compartidas? → actualizar `packages/shared-config` y su test.
3. ¿Agrega un endpoint/función callable nueva? → exportar helpers puros + tests en `apps/functions`.
4. ¿Cambia el flujo de una pantalla completa (ej. checkout)? → documentar el flujo en `docs/` (un `.md` por flujo, estilo `docs/<flujo>_flow.md`).
