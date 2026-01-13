/**
 * Paquete diff - Comparación y migración de esquemas de base de datos
 *
 * @module diff
 */

// Main class
export { PgDiff } from './src/pg-diff';

// Types
export * from './src/types/index';

// Services
export * from './src/core/comparison/services/index';
export * from './src/core/catalog/services/index';
export * from './src/core/connection/services/index';
export * from './src/core/data/services/index';
export * from './src/core/migration/services/index';
export * from './src/core/config/services/index';
export * from './src/core/compatibility/services/index';
export * from './src/core/patch/services/index';
export * from './src/core/validation/services/index';

// Adapters
export * from './src/core/catalog/adapters/index';
export * from './src/core/connection/adapters/index';
export * from './src/core/events/adapters/index';

// Ports
export * from './src/core/catalog/ports/index';
export * from './src/core/connection/ports/index';
export * from './src/core/data/ports/index';
export * from './src/core/events/ports/index';

// Domain Types
export * from './src/core/comparison/domain/types/index';
export * from './src/core/data/domain/types/index';
export * from './src/core/catalog/domain/types/index';
export * from './src/core/connection/domain/types/index';
export * from './src/core/migration/domain/types/index';

// Domain Entities
export * from './src/core/catalog/domain/entities/index';
export * from './src/core/connection/domain/entities/index';

// Domain Schemas
export * from './src/core/comparison/domain/schemas/index';
export * from './src/core/data/domain/schemas/index';
export * from './src/core/catalog/domain/schemas/index';
export * from './src/core/connection/domain/schemas/index';
