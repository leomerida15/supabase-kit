---
description: refactor
---

# Refactorización de Archivos TypeScript - GobernAI a2a-ts

## Contexto
Proyecto: GobernAI a2a-ts (TypeScript), ubicado en `/home/snor/job/gobernAI/a2a-ts`.
Objetivo: Refactorizar archivos TypeScript >250 líneas en módulos más pequeños.

## Criterios
- ✅ Incluir: archivos `.ts` >250 líneas (estrictamente >250)
- ❌ Excluir: archivos `.test.ts`, archivos dentro de directorios ya refactorizados

## Reglas de Refactorización

### Si es CLASE:
1. Crear directorio `NombreClase/` con subdirectorios `methods/` y `types/`
2. Extraer cada método en `methods/[categoria]/[nombre].ts` (ej: `methods/execution/execute.ts`)
3. Crear `index.ts` principal que define la clase importando métodos desde `methods/index.ts`
4. Crear barrel exports (`index.ts`) en cada subdirectorio
5. Actualizar imports en archivos dependientes
6. Eliminar archivo original

### Si NO es CLASE (funciones/objetos):
1. Crear directorio `nombreModulo/` con subdirectorios `types/` y categorías funcionales
2. Extraer funciones relacionadas en subdirectorios temáticos
3. Crear `index.ts` principal que re-exporta todo
4. Crear barrel exports en cada subdirectorio
5. Actualizar imports en archivos dependientes
6. Eliminar archivo original

## Estructura Esperada (Ejemplo Clase)


## Requisitos Técnicos

1. **TypeScript:**
   - Tipos explícitos, nunca `any` implícito
   - `import type` para tipos
   - Rutas relativas correctas para imports

2. **JSDoc:**
   - Comentarios completos en cada función/método
   - `@param`, `@returns`, `@throws` cuando aplique
   - Documentar parámetros y retornos

3. **Organización:**
   - Agrupar métodos por funcionalidad (execution, integration, extraction, utilities, etc.)
   - Mantener misma interfaz pública
   - No cambiar funcionalidad, solo estructura

## Principios de Arquitectura: Hexagonal y SOLID

Toda refactorización debe cumplir estrictamente con **Arquitectura Hexagonal** y **Principios SOLID**. Estos principios son obligatorios y deben aplicarse durante todo el proceso de refactorización.

### Arquitectura Hexagonal (Ports & Adapters)

La arquitectura hexagonal separa la lógica de negocio (dominio) de los detalles técnicos (infraestructura). Durante la refactorización:

1. **Separación de Capas:**
   - **Dominio (Core):** Lógica de negocio pura, sin dependencias externas
   - **Aplicación (Use Cases):** Orquestación de casos de uso, coordina dominio
   - **Infraestructura (Adapters):** Implementaciones concretas (BD, APIs, sistemas de archivos)
   - **Puertos (Interfaces):** Contratos que definen cómo interactuar con el dominio

2. **Estructura de Directorios (si aplica):**
   ```
   NombreClase/
   ├── domain/          # Lógica de negocio pura
   │   ├── entities/    # Entidades del dominio
   │   ├── services/    # Servicios de dominio
   │   └── types/       # Tipos del dominio
   ├── application/     # Casos de uso y orquestación
   │   ├── use-cases/   # Casos de uso específicos
   │   └── ports/       # Interfaces (puertos)
   ├── infrastructure/  # Adaptadores concretos
   │   ├── adapters/    # Implementaciones de puertos
   │   └── repositories/ # Acceso a datos
   └── index.ts         # Punto de entrada público
   ```

3. **Reglas de Dependencias:**
   - El dominio **NUNCA** depende de infraestructura
   - La aplicación depende del dominio, no de infraestructura
   - La infraestructura implementa los puertos definidos en aplicación
   - Las dependencias siempre apuntan hacia adentro (hacia el dominio)

4. **Inversión de Dependencias:**
   - Definir interfaces (puertos) en la capa de aplicación
   - Implementar adaptadores en infraestructura
   - Inyectar dependencias mediante constructor o parámetros

### Principios SOLID

Cada módulo refactorizado debe cumplir con los 5 principios SOLID:

#### 1. **S - Single Responsibility Principle (SRP)**
- Cada clase/función debe tener **una única razón para cambiar**
- Separar responsabilidades en módulos distintos:
  - Validación → `validators/`
  - Transformación → `transformers/`
  - Persistencia → `repositories/`
  - Orquestación → `orchestrators/`
  - Extracción → `extractors/`

**Ejemplo:**
```typescript
// ❌ MAL: Una clase con múltiples responsabilidades
class DataProcessor {
  validate() { }
  transform() { }
  save() { }
  sendEmail() { }
}

// ✅ BIEN: Responsabilidades separadas
class DataValidator { validate() { } }
class DataTransformer { transform() { } }
class DataRepository { save() { } }
class EmailService { send() { } }
```

#### 2. **O - Open/Closed Principle (OCP)**
- Abierto para extensión, cerrado para modificación
- Usar interfaces y abstracciones para permitir extensiones sin modificar código existente
- Preferir composición sobre herencia

**Ejemplo:**
```typescript
// ✅ BIEN: Extensible mediante interfaces
interface ReportGenerator {
  generate(data: ReportData): Promise<Report>;
}

class PDFReportGenerator implements ReportGenerator { }
class MarkdownReportGenerator implements ReportGenerator { }
```

#### 3. **L - Liskov Substitution Principle (LSP)**
- Los subtipos deben ser sustituibles por sus tipos base
- Las implementaciones de interfaces deben cumplir el contrato completo
- No debilitar precondiciones ni postcondiciones

#### 4. **I - Interface Segregation Principle (ISP)**
- Interfaces específicas y pequeñas, no interfaces "gordas"
- Los clientes no deben depender de métodos que no usan
- Crear interfaces granulares por responsabilidad

**Ejemplo:**
```typescript
// ❌ MAL: Interface "gorda"
interface DataProcessor {
  validate(): void;
  transform(): void;
  save(): void;
  sendEmail(): void;
}

// ✅ BIEN: Interfaces segregadas
interface Validator { validate(): void; }
interface Transformer { transform(): void; }
interface Repository { save(): void; }
interface EmailSender { sendEmail(): void; }
```

#### 5. **D - Dependency Inversion Principle (DIP)**
- Depender de abstracciones (interfaces), no de implementaciones concretas
- Los módulos de alto nivel no deben depender de módulos de bajo nivel
- Ambos deben depender de abstracciones

**Ejemplo:**
```typescript
// ❌ MAL: Dependencia directa de implementación
class UserService {
  private db = new PostgreSQLClient();
}

// ✅ BIEN: Dependencia de abstracción
interface UserRepository {
  findById(id: string): Promise<User>;
}

class UserService {
  constructor(private repository: UserRepository) {}
}
```

### Checklist de Verificación

Antes de considerar una refactorización completa, verificar:

- [ ] **SRP:** Cada módulo tiene una única responsabilidad clara
- [ ] **OCP:** El código es extensible sin modificación (interfaces/abstracciones)
- [ ] **LSP:** Las implementaciones son sustituibles por sus interfaces
- [ ] **ISP:** Las interfaces son pequeñas y específicas
- [ ] **DIP:** Las dependencias apuntan hacia abstracciones, no implementaciones
- [ ] **Hexagonal:** El dominio no depende de infraestructura
- [ ] **Puertos:** Las interfaces están definidas en la capa de aplicación
- [ ] **Adaptadores:** Las implementaciones están en infraestructura
- [ ] **Inyección:** Las dependencias se inyectan (constructor/parámetros)

### Aplicación Práctica

Durante la refactorización:

1. **Identificar responsabilidades:** Separar validación, transformación, persistencia, orquestación
2. **Definir puertos:** Crear interfaces para dependencias externas (BD, APIs, archivos)
3. **Extraer adaptadores:** Mover implementaciones concretas a `infrastructure/adapters/`
4. **Aislar dominio:** Mover lógica de negocio pura a `domain/`
5. **Orquestar casos de uso:** Coordinar en `application/use-cases/`
6. **Inyectar dependencias:** Usar constructor injection o parámetros

## Archivos Ya Refactorizados (NO refactorizar de nuevo)
- `supabase-reports-uploader.ts` → `supabase-reports-uploader/`
- `AgentFactory.ts` → `AgentFactory/`
- `executeFormatReportAgent.ts` → `executeFormatReportAgent/`
- `AgentReportGenerators.ts` → `AgentReportGenerators/`
- `agents_resume.ts` → `agents_resume/`
- `reportGenerators.ts` → `reportGenerators/`
- `Phase2AgentsSprint.ts` → `Phase2AgentsSprint/`
- `loader.ts` → `loader/`
- `execute.ts` (FactumFactory) → `execute/`
- `MultiFlowOrchestrator.ts` → `MultiFlowOrchestrator/`
- `PoliteiaFactory.ts` → `PoliteiaFactory/`
- `FlowFactory.ts` → `FlowFactory/`
- `Phase3Integration.ts` → `Phase3Integration/`

## Archivos Pendientes de Refactorizar

### Prioridad Alta (Clases principales):
1. 🔴 `src/utils/flow/politeia/phases/Phase1Briefing.ts` - 306 líneas

### Prioridad Media (Archivos dentro de methods/):
2. 🟡 `src/utils/flow/factum/FactumFactory/methods/executeThematicAgent.ts` - 597 líneas
3. 🟡 `src/utils/agent/factory/Executor/methods/adaptiveSearch.ts` - 497 líneas
4. 🟡 `src/utils/agent/data/mcp/internal_research/InternalResearchClient/methods/getSimulationData.ts` - 479 líneas
5. 🟡 `src/utils/flow/factum/FactumFactory/methods/executeTransversalAgent.ts` - 428 líneas
6. 🟡 `src/utils/flow/factum/FactumFactory/methods/executeOrchestrator.ts` - 418 líneas

## Pasos de Ejecución

1. Leer archivo completo para entender estructura
2. Identificar si es clase o funciones/objetos
3. **Analizar responsabilidades:** Identificar violaciones de SRP y separar responsabilidades
4. **Identificar dependencias:** Mapear dependencias externas para aplicar DIP y arquitectura hexagonal
5. **Diseñar estructura:** Planificar estructura de directorios siguiendo arquitectura hexagonal (domain/application/infrastructure)
6. **Definir puertos (interfaces):** Crear interfaces para dependencias externas (aplicación de DIP)
7. Listar y categorizar métodos/funciones por responsabilidad
8. Crear estructura de directorios respetando capas hexagonales
9. Extraer cada método/función preservando lógica exacta, aplicando SOLID
10. Crear barrel exports en cada subdirectorio
11. Crear `index.ts` principal
12. **Verificar principios:** Revisar checklist de SOLID y arquitectura hexagonal
13. Actualizar imports en archivos dependientes (usar `grep` para encontrar)
14. Eliminar archivo original
15. Verificar: `bun run type:check` y linting

## Comandos Útiles

# Encontrar archivos >250 líneas (excluyendo ya refactorizados)
find src -name "*.ts" -not -name "*.test.ts" \
  -not -path "*/methods/*" \
  -not -path "*/AgentFactory/*" \
  -not -path "*/Phase2AgentsSprint/*" \
  -not -path "*/Phase3Integration/*" \
  -not -path "*/reportGenerators/*" \
  -not -path "*/executeFormatReportAgent/*" \
  -not -path "*/AgentReportGenerators/*" \
  -not -path "*/agents_resume/*" \
  -not -path "*/loader/*" \
  -not -path "*/execute/*" \
  -not -path "*/MultiFlowOrchestrator/*" \
  -not -path "*/PoliteiaFactory/*" \
  -not -path "*/FlowFactory/*" \
  -not -path "*/supabase-reports-uploader/*" \
  -exec wc -l {} \; | awk '$1 > 250 {print $1, $2}' | sort -rn

# Verificar errores TypeScript
bun run type:check

# Encontrar usos de un módulo
grep -r "from.*NombreModulo\|import.*NombreModulo" src/## Instrucciones Específicas

- **Antes de refactorizar:**
  - Verifica que el archivo no esté ya en la lista de refactorizados
  - Analiza responsabilidades y dependencias para planificar estructura hexagonal
  - Identifica violaciones de SOLID en el código actual

- **Durante refactorización:**
  - Mantén la misma firma de métodos/funciones públicas
  - **Aplica SOLID:** Separa responsabilidades (SRP), define interfaces (ISP, DIP), haz código extensible (OCP)
  - **Respeta arquitectura hexagonal:** Separa dominio, aplicación e infraestructura
  - Define puertos (interfaces) antes de implementar adaptadores
  - Inyecta dependencias mediante constructor o parámetros

- **Después de refactorizar:**
  - Verifica checklist de SOLID y arquitectura hexagonal
  - Verifica que no haya errores TypeScript, actualiza TODOS los imports dependientes, elimina archivo original
  - Asegura que el dominio no tenga dependencias de infraestructura

- **JSDoc:** Agrega documentación completa en cada función extraída

## Ejemplo de Uso

Para refactorizar `Phase1Briefing.ts`:
1. Leer archivo completo
2. **Analizar responsabilidades (SRP):**
   - `execute` → Orquestación (aplicación)
   - `generateMasterBrief` → Generación de contenido (dominio)
   - `generateSpecificBriefs` → Generación de contenido (dominio)
   - Validaciones → Validación (dominio)
   - Acceso a datos → Repositorio (infraestructura)
3. **Identificar dependencias (DIP):**
   - Si hay acceso directo a BD/APIs → Crear interfaces (puertos)
   - Definir `BriefingRepository` interface en `application/ports/`
4. **Diseñar estructura hexagonal:**
   ```
   Phase1Briefing/
   ├── domain/
   │   ├── services/
   │   │   ├── brief-generator.ts
   │   │   └── brief-validator.ts
   │   └── types/
   ├── application/
   │   ├── use-cases/
   │   │   └── execute-phase1.ts
   │   └── ports/
   │       └── briefing-repository.ts
   ├── infrastructure/
   │   └── adapters/
   │       └── briefing-repository-impl.ts
   └── index.ts
   ```
5. Categorizar: `execute` → `application/use-cases/`, generación → `domain/services/`
6. Extraer cada método preservando lógica exacta, aplicando SOLID
7. Crear barrel exports en cada subdirectorio
8. Crear `Phase1Briefing/index.ts` que define la clase con inyección de dependencias
9. **Verificar principios:** Revisar checklist SOLID y hexagonal
10. Actualizar import en `PoliteiaFactory/methods/execution/execute.ts`
11. Eliminar `Phase1Briefing.ts`
12. Verificar errores: `bun run type:check 2>&1 | grep Phase1Briefing`

---

**TAREA:** Refactoriza `src/utils/flow/politeia/phases/Phase1Briefing.ts` siguiendo estas reglas. Proporciona un plan detallado primero, luego ejecuta paso por paso verificando errores después de cada paso importante.