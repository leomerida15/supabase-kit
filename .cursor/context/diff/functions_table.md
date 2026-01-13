# Tabla de Funcionalidades Core del Paquete Diff

## Funcionalidades Principales del Paquete de Comparación

Basado en [pg-diff](https://michaelsogos.github.io/pg-diff/) y `packages/diff/old/src`

| Nivel                                     | Funcionalidad                             | Descripción                                                                            | Ubicación en código                                                                                                                | Dependencias                 | Importancia | Estado       |
| ----------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ----------- | ------------ |
| **NIVEL 1 - CONEXIÓN Y CONFIGURACIÓN**    |                                           |                                                                                        |                                                                                                                                    |                              |             | 🟢 Listo |
| 1.1                                       | Gestión de conexiones                     | Crear y gestionar conexiones a bases de datos PostgreSQL (source y target)            | `packages/diff/src/core/connection/` - Servicios y adaptadores de conexión                                                          | Ninguna                      | Crítica     | 🟢 Listo |
| 1.2                                       | Validación de configuración               | Validar configuración de comparación y migración                                       | `packages/diff/src/types/config.types.ts` - Tipos y validación                                                                     | Ninguna                      | Crítica     | 🟢 Listo |
| 1.3                                       | Gestión de eventos                        | Sistema de eventos para notificar progreso y estado de operaciones                      | `packages/diff/src/core/events/` - EventEmitter y adaptadores                                                                     | Ninguna                      | Alta        | 🟢 Listo |
| **NIVEL 2 - CATÁLOGO DE OBJETOS**        |                                           |                                                                                        |                                                                                                                                    |                              |             | 🟢 Listo |
| 2.1                                       | Recopilación de schemas                   | Obtener lista de schemas de la base de datos                                           | `packages/diff/src/core/catalog/` - CatalogService, PostgresCatalogAdapter                                                         | 1.1                          | Crítica     | 🟢 Listo |
| 2.2                                       | Recopilación de extensiones               | Obtener extensiones instaladas en la base de datos                                     | `packages/diff/src/core/catalog/` - retrieveExtensions                                                                             | 1.1                          | Alta        | 🟢 Listo |
| 2.3                                       | Recopilación de tipos (ENUMs)             | Obtener tipos enumerados (ENUM) de la base de datos                                     | `packages/diff/src/core/catalog/` - retrieveEnums                                                                                  | 1.1                          | Alta        | 🟢 Listo |
| 2.4                                       | Recopilación de tipos personalizados      | Obtener tipos personalizados (custom types) de la base de datos                         | `packages/diff/src/core/catalog/` - retrieveTypes                                                                                 | 1.1                          | Alta        | 🟢 Listo |
| 2.5                                       | Recopilación de secuencias                | Obtener secuencias (sequences) de la base de datos                                      | `packages/diff/src/core/catalog/` - retrieveSequences                                                                              | 1.1                          | Alta        | 🟢 Listo |
| 2.6                                       | Recopilación de tablas                    | Obtener tablas, columnas, constraints, índices y triggers de la base de datos         | `packages/diff/src/core/catalog/` - retrieveTables                                                                                | 1.1                          | Crítica     | 🟢 Listo |
| 2.7                                       | Recopilación de vistas                    | Obtener vistas (views) y sus definiciones de la base de datos                           | `packages/diff/src/core/catalog/` - retrieveViews                                                                                  | 1.1                          | Alta        | 🟢 Listo |
| 2.8                                       | Recopilación de vistas materializadas     | Obtener vistas materializadas (materialized views) de la base de datos                 | `packages/diff/src/core/catalog/` - retrieveMaterializedViews                                                                      | 1.1                          | Alta        | 🟢 Listo |
| 2.9                                       | Recopilación de funciones                 | Obtener funciones y procedimientos almacenados de la base de datos                     | `packages/diff/src/core/catalog/` - retrieveFunctions                                                                               | 1.1                          | Alta        | 🟢 Listo |
| 2.10                                      | Recopilación de agregados                 | Obtener funciones agregadas (aggregates) de la base de datos                           | `packages/diff/src/core/catalog/` - retrieveAggregates                                                                              | 1.1                          | Alta        | 🟢 Listo |
| 2.11                                      | Recopilación de claves foráneas           | Obtener claves foráneas (foreign keys) de la base de datos                             | `packages/diff/src/core/catalog/` - retrieveForeignKeys                                                                            | 1.1                          | Alta        | 🟡 En proceso |
| 2.12                                      | Recopilación de políticas RLS            | Obtener políticas de Row Level Security (RLS) de la base de datos                      | `packages/diff/src/core/catalog/` - retrieveRLSPolicies                                                                             | 1.1                          | Alta        | 🟢 Listo |
| 2.13                                      | Recopilación de permisos                  | Obtener permisos GRANT/REVOKE de objetos de la base de datos                           | `packages/diff/src/core/catalog/` - retrievePrivileges                                                                              | 1.1                          | Media       | 🟢 Listo |
| **NIVEL 3 - COMPARACIÓN DE ESQUEMAS**     |                                           |                                                                                        |                                                                                                                                    |                              |             | 🟡 En proceso |
| 3.1                                       | Comparación de extensiones                | Comparar extensiones entre source y target, generar scripts CREATE EXTENSION          | `packages/diff/src/core/comparison/services/extension-comparator.service.ts`                                                       | 2.2                          | Alta        | 🟢 Listo |
| 3.2                                       | Comparación de schemas                    | Comparar schemas entre source y target, generar scripts CREATE SCHEMA                  | `packages/diff/src/core/comparison/services/schema-comparator.service.ts`                                                          | 2.1                          | Crítica     | 🟢 Listo |
| 3.3                                       | Comparación de ENUMs                      | Comparar tipos enumerados entre source y target, generar scripts CREATE TYPE           | `packages/diff/src/core/comparison/services/enum-comparator.service.ts`                                                            | 2.3                          | Alta        | 🟢 Listo |
| 3.4                                       | Comparación de tipos personalizados       | Comparar tipos personalizados entre source y target, generar scripts CREATE TYPE      | `packages/diff/src/core/comparison/services/type-comparator.service.ts`                                                             | 2.4                          | Alta        | 🟢 Listo |
| 3.5                                       | Comparación de secuencias                 | Comparar secuencias entre source y target, generar scripts CREATE SEQUENCE             | `packages/diff/src/core/comparison/services/sequence-comparator.service.ts`                                                          | 2.5                          | Alta        | 🟢 Listo |
| 3.6                                       | Comparación de tablas                     | Comparar tablas, columnas, constraints e índices entre source y target                 | `packages/diff/src/core/comparison/services/table-comparator.service.ts`                                                            | 2.6                          | Crítica     | 🟡 En proceso |
| 3.7                                       | Comparación de vistas                     | Comparar vistas entre source y target, generar scripts CREATE VIEW                    | `packages/diff/src/core/comparison/services/view-comparator.service.ts`                                                            | 2.7                          | Alta        | 🟢 Listo |
| 3.8                                       | Comparación de vistas materializadas      | Comparar vistas materializadas entre source y target                                   | `packages/diff/src/core/comparison/services/materialized-view-comparator.service.ts`                                               | 2.8                          | Alta        | 🟢 Listo |
| 3.9                                       | Comparación de funciones                  | Comparar funciones y procedimientos entre source y target                              | `packages/diff/src/core/comparison/services/function-comparator.service.ts`                                                         | 2.9                          | Alta        | 🟢 Listo |
| 3.10                                      | Comparación de agregados                  | Comparar funciones agregadas entre source y target                                     | `packages/diff/src/core/comparison/services/aggregate-comparator.service.ts`                                                        | 2.10                         | Alta        | 🟢 Listo |
| 3.11                                      | Comparación de claves foráneas            | Comparar foreign keys entre source y target, generar scripts ALTER TABLE ADD CONSTRAINT. Incluye validación cross-schema según configuración (modo strict/simple) | `packages/diff/src/core/comparison/services/foreign-key-comparator.service.ts`                                                     | 2.11                         | Alta        | 🟡 En proceso |
| 3.12                                      | Comparación de políticas RLS              | Comparar políticas RLS entre source y target, generar scripts CREATE POLICY           | `packages/diff/src/core/comparison/services/rls-policy-comparator.service.ts`                                                      | 2.12                         | Alta        | 🟢 Listo |
| 3.13                                      | Comparación de triggers                   | Comparar triggers entre source y target, generar scripts CREATE TRIGGER               | `packages/diff/src/core/comparison/services/trigger-comparator.service.ts`                                                          | 2.6, 2.9                     | Alta        | 🟢 Listo |
| 3.14                                      | Orquestación de comparación               | Orquestar comparación de todos los objetos en orden correcto respetando dependencias  | `packages/diff/src/core/comparison/services/object-comparison.service.ts`                                                           | 3.1-3.13                     | Crítica     | 🟢 Listo |
| **NIVEL 4 - COMPARACIÓN DE DATOS**        |                                           |                                                                                        |                                                                                                                                    |                              |             | 🔴 Por hacer |
| 4.1                                       | Recopilación de registros de tablas       | Obtener registros de tablas configuradas para comparación de datos                      | `packages/diff/src/core/data/` - CollectTableRecords                                                                               | 2.6                          | Alta        | 🔴 Por hacer |
| 4.2                                       | Comparación de registros                  | Comparar registros entre source y target usando campos clave                           | `packages/diff/src/core/data/` - Comparación de datos                                                                              | 4.1                          | Alta        | 🔴 Por hacer |
| 4.3                                       | Generación de scripts INSERT/UPDATE/DELETE | Generar scripts SQL para sincronizar datos entre source y target                       | `packages/diff/src/core/data/` - Generación de scripts de datos                                                                    | 4.2                          | Alta        | 🔴 Por hacer |
| **NIVEL 5 - GENERACIÓN DE SQL**          |                                           |                                                                                        |                                                                                                                                    |                              |             | 🟡 En proceso |
| 5.1                                       | Generación de scripts CREATE              | Generar scripts CREATE para objetos faltantes                                          | `packages/diff/src/core/comparison/services/sql-generator/` - Funciones de generación                                              | 3.1-3.13                     | Crítica     | 🟢 Listo |
| 5.2                                       | Generación de scripts ALTER               | Generar scripts ALTER para modificar objetos existentes                                 | `packages/diff/src/core/comparison/services/sql-generator/` - Funciones de generación                                              | 3.1-3.13                     | Crítica     | 🟡 En proceso |
| 5.3                                       | Generación de scripts DROP                | Generar scripts DROP para objetos que existen solo en target (opcional)                | `packages/diff/src/core/comparison/services/sql-generator/` - Funciones de generación                                              | 3.1-3.13                     | Media       | 🟡 En proceso |
| 5.4                                       | Generación de scripts de permisos         | Generar scripts GRANT/REVOKE para permisos                                             | `packages/diff/src/core/comparison/services/sql-generator/` - Funciones de generación                                              | 2.13                         | Media       | 🟡 En proceso |
| 5.5                                       | Formato y estructura de scripts           | Formatear scripts SQL con comentarios, bloques BEGIN/END y etiquetas                   | `packages/diff/src/core/comparison/services/sql-generator/` - Utilidades de formato                                               | 5.1-5.4                      | Alta        | 🟢 Listo |
| 5.6                                       | Advertencias y errores en scripts         | Agregar comentarios WARN: y ERROR: para problemas potenciales en scripts               | `packages/diff/src/core/comparison/services/sql-generator/` - Sistema de advertencias                                               | 5.1-5.4                      | Alta        | 🔴 Por hacer |
| 5.7                                       | Guardado de archivos patch                | Guardar scripts SQL generados en archivos con timestamp y nombre                       | `packages/diff/old/src/api/CompareApi.js` - saveSqlScript                                                                           | 5.5                          | Crítica     | 🔴 Por hacer |
| **NIVEL 6 - MIGRACIÓN**                   |                                           |                                                                                        |                                                                                                                                    |                              |             | 🟡 En proceso |
| 6.1                                       | Preparación de tabla de historial         | Crear tabla de historial de migraciones si no existe                                   | `packages/diff/old/src/core.js` - prepareMigrationsHistoryTable                                                                    | 1.1                          | Crítica     | 🔴 Por hacer |
| 6.2                                       | Lectura de archivos patch                 | Leer y parsear archivos patch SQL del directorio configurado                           | `packages/diff/old/src/api/MigrationApi.js` - readPatch                                                                            | 1.2                          | Crítica     | 🔴 Por hacer |
| 6.3                                       | Verificación de estado de patch           | Verificar estado de patch en tabla de historial (TO_APPLY, IN_PROGRESS, DONE, ERROR)   | `packages/diff/old/src/api/MigrationApi.js` - checkPatchStatus                                                                     | 6.1                          | Crítica     | 🔴 Por hacer |
| 6.4                                       | Ejecución de patches                      | Ejecutar patches SQL en bloques BEGIN/END con manejo de transacciones                  | `packages/diff/old/src/api/MigrationApi.js` - applyPatch, executePatchScript                                                        | 6.2, 6.3                     | Crítica     | 🔴 Por hacer |
| 6.5                                       | Registro en historial                     | Registrar patches aplicados en tabla de historial con estado y mensajes                 | `packages/diff/old/src/api/MigrationApi.js` - updateRecordToHistoryTable, addRecordToHistoryTable                                 | 6.4                          | Crítica     | 🔴 Por hacer |
| 6.6                                       | Migración con force                       | Opción para forzar ejecución de patches con errores previos                            | `packages/diff/old/src/api/MigrationApi.js` - migrate                                                                              | 6.3, 6.4                     | Alta        | 🔴 Por hacer |
| 6.7                                       | Migración a source o target               | Opción para ejecutar migraciones en source o target database                           | `packages/diff/old/src/api/MigrationApi.js` - migrate                                                                              | 6.4                          | Alta        | 🔴 Por hacer |
| 6.8                                       | Registro sin ejecución                    | Registrar patch en historial sin ejecutarlo (savePatch)                                | `packages/diff/old/src/api/MigrationApi.js` - savePatch                                                                            | 6.1, 6.5                     | Media       | 🔴 Por hacer |
| **NIVEL 7 - VALIDACIÓN Y COMPATIBILIDAD** |                                           |                                                                                        |                                                                                                                                    |                              |             | 🟡 En proceso |
| 7.1                                       | Validación de versión de PostgreSQL       | Verificar versión de PostgreSQL y compatibilidad de características                    | `packages/diff/src/core/compatibility/services/compatibility.service.ts`                                                           | 1.1                          | Alta        | 🟢 Listo |
| 7.2                                       | Validación de relaciones cross-schema      | Validar foreign keys entre schemas distintos con dos modos: strict (ambos schemas deben estar en namespaces) y simple (confía en el usuario, usa script literal) | `packages/diff/src/core/comparison/services/foreign-key-comparator.service.ts`                                                     | 2.11, 3.11                   | Alta        | 🔴 Por hacer |
| 7.3                                       | Validación de integridad referencial      | Detectar problemas de integridad referencial en foreign keys                          | Sistema de validación - Validación de integridad                                                                                   | 2.11, 3.11                   | Media       | 🔴 Por hacer |
| 7.4                                       | Validación de dependencias                | Validar dependencias entre objetos antes de generar scripts                            | Sistema de validación - Validación de dependencias                                                                                 | 3.1-3.13                     | Media       | 🔴 Por hacer |

## Resumen de Dependencias Críticas

```
NIVEL 1 (Conexión y Configuración)
    ↓
NIVEL 2 (Catálogo de Objetos)
    ↓
NIVEL 3 (Comparación de Esquemas) ─┐
    ↓                                │
NIVEL 4 (Comparación de Datos)      │
    ↓                                │
NIVEL 5 (Generación de SQL) ←───────┘
    ↓
NIVEL 6 (Migración)
    ↓
NIVEL 7 (Validación y Compatibilidad)
```

## Notas sobre la Arquitectura

El paquete `packages/diff` es una librería core sin dependencias de CLI:

-   **Nivel 1 (Conexión)**: Gestión de conexiones a PostgreSQL y configuración
-   **Nivel 2 (Catálogo)**: Recopilación de objetos de base de datos desde `pg_catalog` e `information_schema`
-   **Nivel 3 (Comparación)**: Comparación de objetos entre source y target, generación de diferencias
-   **Nivel 4 (Datos)**: Comparación de registros en tablas (opcional, requiere configuración)
-   **Nivel 5 (Generación SQL)**: Generación de scripts SQL para aplicar diferencias
-   **Nivel 6 (Migración)**: Aplicación de patches SQL y gestión de historial
-   **Nivel 7 (Validación)**: Validación de compatibilidad y integridad

## Leyenda de Estados

La columna **Estado** indica el estado actual de cada funcionalidad en el desarrollo del paquete:

-   🔴 **Por hacer**: Funcionalidad identificada pero aún no implementada
-   🟡 **En proceso**: Funcionalidad actualmente en desarrollo o parcialmente implementada
-   🟢 **Listo**: Funcionalidad completada y validada

### Estado de Niveles

El estado del nivel principal (ej: **NIVEL 1 - CONEXIÓN**) indica el estado general del nivel completo:

-   Si todas las sub-funcionalidades están **Listo** → El nivel está **Listo**
-   Si alguna está **En proceso** → El nivel está **En proceso**
-   Si todas están **Por hacer** → El nivel está **Por hacer**

## Validación Cross-Schema para Foreign Keys

La funcionalidad 7.2 implementa validación para relaciones entre tablas en schemas distintos con dos modos de operación:

### Modo Strict (Estricto)

-   **Requisito**: Ambos schemas (el de la tabla local y el de la tabla referenciada) deben estar completamente evaluados en la migración
-   **Validación**: Solo se incluyen foreign keys cross-schema si ambos schemas están en la lista `config.namespaces`
-   **Comportamiento**: Si alguno de los schemas no está configurado, la foreign key se omite del script generado
-   **Uso**: Recomendado cuando se requiere control total sobre qué schemas se migran

**Ejemplo:**
-   Configuración: `namespaces: ['schema1', 'schema2']`
-   Foreign key: `schema1.tabla1` → `schema2.tabla2` → ✅ **Incluida** (ambos schemas configurados)
-   Foreign key: `schema1.tabla1` → `schema3.tabla3` → ❌ **Omitida** (schema3 no está configurado)

### Modo Simple

-   **Requisito**: No requiere que los schemas estén en la configuración
-   **Validación**: No valida existencia de schemas, confía en el usuario
-   **Comportamiento**: Usa el script literal de la tabla origen (source), copiando exactamente la definición de la foreign key
-   **Uso**: Recomendado cuando el usuario tiene control sobre los schemas y confía en que existen en la base de datos target

**Ejemplo:**
-   Configuración: `namespaces: ['schema1']`
-   Foreign key: `schema1.tabla1` → `schema2.tabla2` → ✅ **Incluida** (sin validación, script literal)
-   Foreign key: `schema1.tabla1` → `schema3.tabla3` → ✅ **Incluida** (sin validación, script literal)

### Configuración

La validación se configura mediante `crossSchemaForeignKeys` en `SchemaCompare`:

```typescript
crossSchemaForeignKeys?: {
    enabled: boolean;  // Habilita la validación cross-schema
    mode: 'strict' | 'simple';  // Modo de validación
}
```

Si `crossSchemaForeignKeys` no está configurado o `enabled: false`, el comportamiento por defecto es equivalente al modo `simple` (incluir todas las foreign keys sin validación).

## Referencias

-   Documentación original: [pg-diff](https://michaelsogos.github.io/pg-diff/)
-   Código base: `packages/diff/old/src/`
-   Implementación nueva: `packages/diff/src/`
