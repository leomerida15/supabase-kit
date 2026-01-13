/**
 * Tipos de configuración para el sistema de comparación y migración de PostgreSQL.
 *
 * @module types/config
 */

/**
 * Configuración del cliente de PostgreSQL.
 * Define los parámetros de conexión a una base de datos PostgreSQL.
 *
 * @interface ClientConfig
 */
export interface ClientConfig {
	/**
	 * Dirección del host o IP del servidor PostgreSQL.
	 */
	host: string;

	/**
	 * Puerto del servidor PostgreSQL (por defecto 5432).
	 */
	port: number;

	/**
	 * Nombre de la base de datos a la cual conectarse.
	 * No puede ser null o vacío para establecer la conexión.
	 */
	database: string | null;

	/**
	 * Nombre de usuario para autenticación en PostgreSQL.
	 */
	user: string;

	/**
	 * Contraseña para autenticación en PostgreSQL.
	 * Puede ser null si se usa autenticación sin contraseña.
	 */
	password: string | null;

	/**
	 * Nombre de la aplicación que aparece en las conexiones de PostgreSQL.
	 * Útil para identificar la aplicación en las vistas del sistema.
	 */
	applicationName: string;

	/**
	 * Indica si se debe usar SSL para la conexión.
	 * true para habilitar SSL, false para conexiones no seguras.
	 */
	ssl: boolean;
}

/**
 * Definición de tabla para comparación de datos.
 * Especifica qué tablas deben ser comparadas y qué campos usar como clave.
 *
 * @interface TableDefinition
 */
export interface TableDefinition {
	/**
	 * Nombre de la tabla (sin incluir el esquema).
	 */
	tableName: string;

	/**
	 * Nombre del esquema donde se encuentra la tabla.
	 * Si no se especifica, se usa 'public' por defecto.
	 */
	tableSchema: string;

	/**
	 * Lista de campos que conforman la clave primaria o identificador único.
	 * Estos campos se usan para identificar y comparar registros entre bases de datos.
	 */
	tableKeyFields: string[];
}

/**
 * Opciones de comparación de datos entre tablas.
 * Configura qué tablas y cómo deben ser comparados los datos.
 *
 * @interface DataCompare
 */
export interface DataCompare {
	/**
	 * Habilita o deshabilita la comparación de datos.
	 * true para habilitar la comparación de registros entre tablas.
	 */
	enable: boolean;

	/**
	 * Lista de tablas que deben ser comparadas cuando enable es true.
	 * Cada tabla debe tener definidos sus campos clave.
	 */
	tables: TableDefinition[];
}

/**
 * Opciones de comparación de esquemas.
 * Configura qué objetos de esquema deben ser comparados y cómo.
 *
 * @interface SchemaCompare
 */
export interface SchemaCompare {
	/**
	 * Lista de nombres de esquemas (namespaces) a comparar.
	 * Si está vacío o null, se comparan todos los esquemas disponibles.
	 */
	namespaces: string[];

	/**
	 * Habilita o deshabilita la comparación de extensiones.
	 * Por defecto: true
	 */
	enableExtensions?: boolean;

	/**
	 * Habilita o deshabilita la comparación de enumeraciones (ENUMs).
	 * Por defecto: true
	 */
	enableEnums?: boolean;

	/**
	 * Habilita o deshabilita la comparación de tipos personalizados.
	 * Por defecto: true
	 */
	enableTypes?: boolean;

	/**
	 * Habilita o deshabilita la comparación de secuencias.
	 * Por defecto: true
	 */
	enableSequences?: boolean;

	/**
	 * Habilita o deshabilita la comparación de tablas.
	 * Por defecto: true
	 */
	enableTables?: boolean;

	/**
	 * Habilita o deshabilita la comparación de vistas.
	 * Por defecto: true
	 */
	enableViews?: boolean;

	/**
	 * Habilita o deshabilita la comparación de vistas materializadas.
	 * Por defecto: true
	 */
	enableMaterializedViews?: boolean;

	/**
	 * Habilita o deshabilita la comparación de funciones.
	 * Por defecto: true
	 */
	enableFunctions?: boolean;

	/**
	 * Habilita o deshabilita la comparación de agregados.
	 * Por defecto: true
	 */
	enableAggregates?: boolean;

	/**
	 * Habilita o deshabilita la comparación de claves foráneas.
	 * Por defecto: true
	 */
	enableForeignKeys?: boolean;

	/**
	 * Habilita o deshabilita la comparación de políticas RLS (Row Level Security).
	 * Por defecto: true
	 */
	enableRLSPolicies?: boolean;

	/**
	 * Habilita o deshabilita la comparación de triggers.
	 * Por defecto: true
	 */
	enableTriggers?: boolean;

	/**
	 * Si es true, genera scripts DROP para tablas que existen solo en la base de datos objetivo.
	 */
	dropMissingTable: boolean;

	/**
	 * Si es true, genera scripts DROP para vistas que existen solo en la base de datos objetivo.
	 */
	dropMissingView: boolean;

	/**
	 * Si es true, genera scripts DROP para funciones que existen solo en la base de datos objetivo.
	 */
	dropMissingFunction: boolean;

	/**
	 * Si es true, genera scripts DROP para agregados que existen solo en la base de datos objetivo.
	 */
	dropMissingAggregate: boolean;

	/**
	 * Si es true, genera scripts DROP para políticas RLS que existen solo en la base de datos objetivo.
	 * Solo aplica si enableRLSPolicies es true.
	 * Por defecto: false
	 */
	dropMissingRLSPolicy?: boolean;

	/**
	 * Lista de nombres de roles para los cuales se compararán permisos GRANT/REVOKE.
	 * Si está vacío, no se generan scripts de permisos.
	 */
	roles: string[];

	/**
	 * Configuración para claves foráneas entre esquemas.
	 * Por defecto: undefined (no permitir cross-schema FKs)
	 */
	crossSchemaForeignKeys?: {
		enabled: boolean;
		mode: 'strict' | 'simple';
	};
}

/**
 * Opciones generales de comparación.
 * Configura aspectos generales del proceso de comparación y generación de scripts.
 *
 * @interface CompareOptions
 */
export interface CompareOptions {
	/**
	 * Directorio donde se guardarán los archivos de patch SQL generados.
	 * Puede ser una ruta absoluta o relativa al directorio de trabajo.
	 */
	outputDirectory: string;

	/**
	 * Nombre del autor del script generado.
	 * Se incluye como comentario en los archivos SQL generados.
	 */
	author: string | null;

	/**
	 * Si es true, intenta obtener el nombre del autor desde la configuración de Git.
	 * Se busca primero en configuración local, luego global.
	 */
	getAuthorFromGit: boolean;

	/**
	 * Opciones de comparación de esquemas.
	 */
	schemaCompare: SchemaCompare;

	/**
	 * Opciones de comparación de datos.
	 */
	dataCompare: DataCompare;
}

/**
 * Opciones de migración.
 * Configura el comportamiento del sistema de migraciones y gestión de patches.
 *
 * @interface MigrationOptions
 */
export interface MigrationOptions {
	/**
	 * Directorio donde se encuentran los archivos de patch SQL a aplicar.
	 * Puede ser null si no se usa el sistema de migraciones.
	 */
	patchesDirectory: string | null;

	/**
	 * Nombre de la tabla de historial de migraciones.
	 * Esta tabla almacena información sobre los patches aplicados.
	 */
	historyTableName: string;

	/**
	 * Nombre del esquema donde se creará la tabla de historial de migraciones.
	 */
	historyTableSchema: string;
}

/**
 * Configuración completa del sistema.
 * Agrupa todas las configuraciones necesarias para ejecutar comparaciones y migraciones.
 *
 * @interface Config
 */
export interface Config {
	/**
	 * Configuración del cliente de la base de datos objetivo (target).
	 * Es la base de datos que será actualizada con los cambios.
	 */
	targetClient: ClientConfig;

	/**
	 * Configuración del cliente de la base de datos fuente (source).
	 * Es la base de datos que contiene los cambios a aplicar.
	 */
	sourceClient: ClientConfig;

	/**
	 * Opciones de comparación entre las bases de datos.
	 */
	compareOptions: CompareOptions;

	/**
	 * Opciones para el sistema de migraciones.
	 */
	migrationOptions: MigrationOptions;
}
