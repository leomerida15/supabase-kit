# Supa-Kit CLI

Herramienta CLI para comparar y migrar bases de datos PostgreSQL mediante patches SQL.

Hecho con ❤️ por GobernAI LLC y LatamEarth C.A.

-   https://gobern.ai/
-   https://latamearth.com

## Requisitos

-   **Bun** >= 1.3 o **Node.js** >= 20
-   Acceso a bases de datos PostgreSQL (source y target)

## Instalación

### Instalación global desde npm (recomendado)

```bash
npm install -g @supabase-kit/cli
```

O usando Bun:

```bash
bun add -g @supabase-kit/cli
```

### Instalación local desde el código fuente

Si estás trabajando desde el repositorio:

```bash
# Desde la raíz del monorepo
bun install

# Construir el CLI
cd apps/cli
bun run build
```

Para usar el CLI localmente después de construir:

```bash
# Desde apps/cli
bun run index.ts diff [subcomando]

# O si está instalado globalmente
supa-kit diff [subcomando]
```

## Uso

### Ejecutar el CLI

```bash
supa-kit
```

Sin argumentos, el CLI mostrará el mensaje de bienvenida con la lista de comandos disponibles.

### Sintaxis general

```bash
supa-kit diff [subcomando]
```

## Comandos

El CLI utiliza `diff` como comando raíz. Todos los comandos están organizados como subcomandos de `diff`:

| Comando        | Descripción                                       |
| -------------- | ------------------------------------------------- |
| `diff`         | Comando raíz - muestra subcomandos disponibles    |
| `diff add`     | Agregar aplicación, entorno o comparación         |
| `diff ls`      | Listar aplicaciones, entornos y comparaciones     |
| `diff compare` | Generar patch SQL (comparar bases de datos)       |
| `diff migrate` | Ejecutar migraciones (aplicar patches pendientes) |
| `diff status`  | Ver estado de todos los patches                   |
| `diff history` | Ver historial de patches aplicados                |

### `diff` - Comando raíz

Muestra la lista de subcomandos disponibles.

**Uso:**

```bash
supa-kit diff
```

Muestra todos los subcomandos disponibles bajo `diff`.

### `diff add` - Agregar configuración

Permite crear nuevas aplicaciones, entornos y comparaciones.

**Uso:**

```bash
supa-kit diff add
```

**Qué hace:**

-   Permite crear o seleccionar una aplicación
-   Permite agregar nuevos entornos (configuración de conexión a bases de datos)
-   Permite crear comparaciones entre entornos (source y target)
-   Configura opciones de comparación y migración

**Flujo interactivo:**

1. Seleccionar o crear aplicación
2. Elegir entre crear entorno o comparación
3. Si es entorno: configurar conexión (host, port, database, user, ssl)
4. Si es comparación: seleccionar entornos source y target, configurar opciones

### `diff ls` - Listar configuración

Muestra información sobre aplicaciones, entornos y comparaciones configuradas.

**Uso:**

```bash
supa-kit diff ls
```

**Qué hace:**

-   Lista todas las aplicaciones configuradas
-   Permite seleccionar una aplicación para ver detalles
-   Muestra entornos configurados en la aplicación
-   Muestra comparaciones configuradas entre entornos

### `diff compare` - Generar patch SQL

Compara dos bases de datos y genera un archivo SQL con las diferencias (patch).

**Uso:**

```bash
supa-kit diff compare
```

**Qué hace:**

1. Permite seleccionar una aplicación
2. Permite seleccionar una comparación configurada
3. Solicita credenciales de ambas bases de datos (source y target)
4. Compara los esquemas de ambas bases de datos
5. Genera un archivo SQL patch con las diferencias
6. Guarda el patch en el directorio configurado

**Nota:** Los patches se guardan con nombres únicos basados en timestamp para evitar sobrescrituras.

### `diff migrate` - Aplicar migraciones

Ejecuta los patches SQL pendientes en la base de datos objetivo.

**Uso:**

```bash
supa-kit diff migrate
```

**Qué hace:**

1. Permite seleccionar una aplicación
2. Permite seleccionar una comparación configurada
3. Solicita opciones de migración:
    - **Force execution**: Ejecutar patches aunque tengan errores
    - **Execute on source**: Ejecutar en la base de datos source en lugar de target
4. Solicita credenciales de la base de datos objetivo
5. Aplica los patches pendientes en orden
6. Registra los patches aplicados en el historial

**Opciones importantes:**

-   **Force execution**: Útil cuando hay patches que pueden fallar pero quieres continuar
-   **Execute on source**: Permite sincronizar la base de datos source con los cambios

### `diff status` - Ver estado de patches

Muestra el estado actual de todos los patches (pendientes, aplicados, con errores).

**Uso:**

```bash
supa-kit diff status
```

**Qué hace:**

1. Permite seleccionar una aplicación
2. Permite seleccionar una comparación
3. Conecta a la base de datos objetivo
4. Muestra el estado de cada patch:
    - **Pending**: Patches no aplicados
    - **Applied**: Patches ya aplicados
    - **Error**: Patches que fallaron al aplicarse

### `diff history` - Ver historial

Muestra el historial de patches aplicados en una base de datos.

**Uso:**

```bash
supa-kit diff history
```

**Qué hace:**

1. Permite seleccionar una aplicación
2. Permite seleccionar una comparación
3. Conecta a la base de datos objetivo
4. Muestra el historial completo de patches aplicados
5. Incluye información como fecha de aplicación, nombre del patch, etc.

## Flujo de Migración Completo

A continuación se describe el flujo paso a paso para realizar una migración completa de una base de datos.

### Paso 1: Configurar la aplicación y entornos

Si es la primera vez que usas el CLI, necesitas configurar la aplicación y los entornos:

```bash
# Ejecutar el comando add
supa-kit diff add
```

**Flujo:**

1. Crear una nueva aplicación (o seleccionar existente)
2. Agregar entorno **source** (base de datos de origen)
3. Agregar entorno **target** (base de datos de destino)
4. Crear una comparación que relacione source y target

**Ejemplo de configuración:**

-   Aplicación: `mi-proyecto`
-   Entorno source: `dev` (localhost:5432/dev)
-   Entorno target: `qa` (localhost:5432/qa)
-   Comparación: `dev-to-qa`

### Paso 2: Verificar configuración

Antes de generar patches, verifica que la configuración esté correcta:

```bash
supa-kit diff ls
```

Esto te permitirá verificar que los entornos y comparaciones estén configurados correctamente.

### Paso 3: Generar patches SQL

Compara las bases de datos y genera los patches SQL:

```bash
supa-kit diff compare
```

**Proceso:**

1. Selecciona la aplicación (`mi-proyecto`)
2. Selecciona la comparación (`dev-to-qa`)
3. Ingresa las credenciales de la base de datos source
4. Ingresa las credenciales de la base de datos target
5. El CLI compara ambas bases de datos
6. Se genera un archivo SQL patch con las diferencias

**Resultado:**

Se crea un archivo SQL en el directorio configurado (por defecto `./patches/`) con un nombre único basado en timestamp, por ejemplo: `20240101120000_dev-to-qa.sql`

### Paso 4: Verificar estado de patches

Antes de aplicar las migraciones, verifica el estado de los patches:

```bash
supa-kit diff status
```

**Proceso:**

1. Selecciona la aplicación
2. Selecciona la comparación
3. Ingresa las credenciales de la base de datos target
4. El CLI muestra el estado de todos los patches:
    - Patches pendientes de aplicar
    - Patches ya aplicados
    - Patches con errores

**Resultado:**

Puedes ver qué patches están listos para aplicar y cuáles ya fueron aplicados anteriormente.

### Paso 5: Aplicar migraciones

Ejecuta los patches pendientes en la base de datos objetivo:

```bash
supa-kit diff migrate
```

**Proceso:**

1. Selecciona la aplicación
2. Selecciona la comparación
3. Elige las opciones:
    - **Force execution**: `No` (recomendado para producción)
    - **Execute on source**: `No` (aplicar en target)
4. Ingresa las credenciales de la base de datos target
5. El CLI aplica los patches pendientes en orden
6. Muestra el progreso de la migración

**Resultado:**

Los patches se aplican secuencialmente en la base de datos target. Si algún patch falla, el proceso se detiene (a menos que uses force execution).

### Paso 6: Verificar historial

Después de aplicar las migraciones, verifica el historial:

```bash
supa-kit diff history
```

**Proceso:**

1. Selecciona la aplicación
2. Selecciona la comparación
3. Ingresa las credenciales de la base de datos target
4. El CLI muestra el historial completo de patches aplicados

**Resultado:**

Puedes ver un registro completo de todos los patches que se han aplicado, incluyendo fechas y nombres de archivos.

## Orden Recomendado de Comandos

Para realizar una migración completa por primera vez:

```bash
# 1. Configurar (solo la primera vez)
supa-kit diff add

# 2. Verificar configuración
supa-kit diff ls

# 3. Generar patches
supa-kit diff compare

# 4. Verificar estado antes de migrar
supa-kit diff status

# 5. Aplicar migraciones
supa-kit diff migrate

# 6. Verificar historial
supa-kit diff history
```

Para migraciones subsecuentes (cuando ya está configurado):

```bash
# 1. Generar nuevos patches
supa-kit diff compare

# 2. Verificar estado
supa-kit diff status

# 3. Aplicar migraciones
supa-kit diff migrate

# 4. Verificar historial
supa-kit diff history
```

## Estructura de Configuración

Las configuraciones se almacenan en archivos `.diffconfig.json` en el directorio de cada aplicación.

**Ubicación:**

```
.config/
└── [nombre-aplicacion]/
    └── [nombre-aplicacion].diffconfig.json
```

**Estructura del archivo de configuración:**

```json
{
    "entornos": {
        "dev": {
            "host": "localhost",
            "port": 5432,
            "database": "dev",
            "user": "dev",
            "ssl": true,
            "applicationName": "dev"
        },
        "qa": {
            "host": "localhost",
            "port": 5432,
            "database": "qa",
            "user": "qa",
            "ssl": true,
            "applicationName": "qa"
        }
    },
    "comparaciones": {
        "dev-to-qa": {
            "sourceClient": "dev",
            "targetClient": "qa",
            "compareOptions": {
                "outputDirectory": "./patches"
            },
            "migrationOptions": {
                "patchesDirectory": "./patches"
            }
        }
    }
}
```

## Notas Importantes

1. **Credenciales**: Las contraseñas no se almacenan en los archivos de configuración por seguridad. Se solicitan en cada operación que las requiere.

2. **Patches únicos**: Cada patch generado tiene un nombre único basado en timestamp para evitar sobrescrituras.

3. **Orden de aplicación**: Los patches se aplican en orden cronológico (por nombre de archivo).

4. **Base de datos target**: Por defecto, las migraciones se aplican en la base de datos target. Puedes usar la opción "Execute on source" para aplicar en la base de datos source.

5. **Force execution**: Usa con precaución. Permite continuar con patches que tienen errores, pero puede dejar la base de datos en un estado inconsistente.

## Solución de Problemas

### Error: "No applications configured"

Ejecuta `supa-kit diff add` para crear tu primera aplicación y configuración.

### Error: "No comparisons configured"

Ejecuta `supa-kit diff add` y crea una comparación para tu aplicación.

### Error de conexión a la base de datos

Verifica que:

-   Las credenciales sean correctas
-   La base de datos esté accesible
-   Los parámetros de conexión (host, port) sean correctos
-   El SSL esté configurado correctamente

### Error al aplicar patches

1. Verifica el estado con `supa-kit diff status`
2. Revisa los mensajes de error específicos
3. Verifica que no haya conflictos de datos
4. Considera usar `force execution` solo si es necesario y entiendes las consecuencias

## Soporte

Para más información y soporte:

-   **Repositorio**: https://github.com/leomerida15/supabase-kit
-   **GobernAI**: https://gobern.ai/
-   **LatamEarth**: https://latamearth.com
