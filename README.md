# Supa Kit Monorepo

Monorepo gestionado con Bun workspaces.

## Estructura

```
supa-kit/
├── apps/          # Aplicaciones
├── packages/      # Paquetes compartidos
└── package.json   # Configuración del workspace
```

## Workspaces

Este monorepo utiliza Bun workspaces para gestionar múltiples proyectos en un solo repositorio.

- **apps/**: Contiene todas las aplicaciones del monorepo
- **packages/**: Contiene paquetes compartidos y librerías

## Instalación

```bash
bun install
```

## Scripts

- `bun dev`: Ejecuta el script `dev` en todas las apps
- `bun build`: Ejecuta el script `build` en todos los packages
- `bun test`: Ejecuta los tests

## Agregar un nuevo workspace

1. Crear una nueva carpeta en `apps/` o `packages/`
2. Inicializar un `package.json` en esa carpeta
3. Ejecutar `bun install` en la raíz para que Bun reconozca el nuevo workspace

## Referencias entre workspaces

Puedes usar dependencias locales con `workspace:*`:

```json
{
  "dependencies": {
    "mi-package": "workspace:*"
  }
}
```