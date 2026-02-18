# CLI (supa-kit)

CLI para comparación y migración de bases de datos PostgreSQL. Binario: **supa-kit**.

## Instalación / uso

Desde el monorepo (en la raíz):

```bash
bun run --filter @supabase-kit/cli start
```

Tras hacer build del package CLI, puedes instalar globalmente o usar con `bunx`/`npx` según cómo publiques el paquete.

## Comandos

### Sin argumentos

Muestra la bienvenida y la lista de comandos disponibles.

### diff

Comando principal. Uso: `supa-kit diff <subcomando>`.

| Subcomando | Descripción |
|------------|-------------|
| **add** | Añadir aplicación, entorno o comparación (configuración interactiva). |
| **ls** | Listar aplicaciones, entornos y comparaciones. |
| **compare** | Generar patch SQL comparando dos bases de datos. |
| **migrate** | Ejecutar migraciones (aplicar patches pendientes). |
| **status** | Ver estado de todos los patches. |
| **history** | Ver historial de patches aplicados. |

## Ejemplos

```bash
# Ver ayuda de diff
supa-kit diff

# Añadir configuración (app, entornos, comparación)
supa-kit diff add

# Listar configuración
supa-kit diff ls

# Generar patch entre dos DBs
supa-kit diff compare

# Aplicar migraciones pendientes
supa-kit diff migrate

# Estado de patches
supa-kit diff status

# Historial aplicado
supa-kit diff history
```

---

## Casos de uso

### 1. Primer uso: configurar una aplicación y comparar dev vs staging

Flujo típico la primera vez que usas el CLI:

1. **Añadir aplicación y entornos**  
   Ejecuta `supa-kit diff add` y sigue el asistente:
   - Crear una aplicación (ej. `mi-app`).
   - Añadir dos entornos (ej. `dev` y `staging`) con sus cadenas de conexión Postgres.
   - Crear una comparación que use ambos entornos (origen → destino, ej. dev → staging).

2. **Listar la configuración**  
   Comprueba que todo quedó guardado:
   ```bash
   supa-kit diff ls
   ```

3. **Generar el patch SQL**  
   Compara el esquema (y opcionalmente datos) entre las dos bases y genera un archivo de patch:
   ```bash
   supa-kit diff compare
   ```
   El CLI te pedirá elegir aplicación y comparación. El resultado es un patch SQL que puedes revisar y aplicar después en el entorno destino.

### 2. Flujo de migración: aplicar patches en un entorno

Una vez tienes comparaciones y patches generados:

1. **Ver qué patches hay pendientes**  
   ```bash
   supa-kit diff status
   ```

2. **Aplicar migraciones pendientes**  
   Ejecuta el flujo guiado para aplicar los patches en la base de datos elegida:
   ```bash
   supa-kit diff migrate
   ```
   Seleccionas aplicación, comparación y el patch a aplicar; el CLI se conecta a la DB y ejecuta el SQL.

Útil para llevar cambios de schema de dev a staging y de staging a producción de forma controlada.

### 3. Consultar estado e historial en un proyecto ya configurado

En un proyecto donde ya se han configurado aplicaciones y se han aplicado migraciones:

- **Estado actual de los patches**  
  Ver qué patches existen y cuáles están aplicados en cada entorno:
  ```bash
  supa-kit diff status
  ```

- **Historial de migraciones aplicadas**  
  Ver el registro de patches ya ejecutados:
  ```bash
  supa-kit diff history
  ```

Ayuda a auditar qué cambios se han llevado a cada base y cuándo.

---

Hecho con ❤️ por GobernAI y LatamEarth.
