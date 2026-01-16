/**
 * Test para verificar si se puede ejecutar ANALYZE usando pool de conexiones
 * y actualizar reltuples en PostgreSQL.
 *
 * @module test/diff/ANALYZE.test
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
// Usar rutas relativas desde el directorio test/diff
import { BunDatabaseAdapter } from '../../packages/diff/src/core/connection/adapters/bun-database.adapter.js';
import { ConnectionService } from '../../packages/diff/src/core/connection/services/connection.service.js';
import type { DatabaseConnection } from '../../packages/diff/src/core/connection/domain/types/index.js';

/**
 * Configuración de un entorno (base de datos).
 */
interface EnvironmentConfig {
	host: string;
	port: number;
	database: string;
	user: string;
	ssl: boolean;
}

/**
 * Estructura del archivo de configuración.
 */
interface ConfigFile {
	environments: Record<string, EnvironmentConfig>;
	comparisons: Record<string, unknown>;
}

/**
 * Carga la configuración desde el archivo JSON en apps/cli/.
 */
function loadConfig(): ConfigFile {
	// Obtener la ruta del archivo de configuración relativa al directorio del test
	const testDir = dirname(new URL(import.meta.url).pathname);
	const projectRoot = join(testDir, '../../apps/cli');
	const configPath = join(projectRoot, 'GobernAI.diffconfig.json');
	
	if (!existsSync(configPath)) {
		throw new Error(`Config file not found: ${configPath}`);
	}
	
	const configContent = readFileSync(configPath, 'utf-8');
	return JSON.parse(configContent) as ConfigFile;
}

/**
 * Test principal para verificar ANALYZE y reltuples.
 */
async function testAnalyzeWithPool(environmentName?: string): Promise<void> {
	console.log('🧪 Test: Verificar ANALYZE con pool de conexiones\n');

	// Cargar configuración
	const config = loadConfig();
	const environments = Object.keys(config.environments);

	if (environments.length === 0) {
		throw new Error('No environments found in configuration');
	}

	// Seleccionar entorno
	let envName: string;
	if (environmentName && config.environments[environmentName]) {
		envName = environmentName;
	} else if (environmentName) {
		throw new Error(`Environment "${environmentName}" not found. Available: ${environments.join(', ')}`);
	} else {
		// Usar el primer entorno disponible o DEV si existe
		envName = config.environments['DEV'] ? 'DEV' : environments[0];
	}

	const envConfig = config.environments[envName];

	console.log(`📋 Using environment: ${envName}`);
	console.log(`   Host: ${envConfig.host}`);
	console.log(`   Port: ${envConfig.port}`);
	console.log(`   Database: ${envConfig.database}`);
	console.log(`   User: ${envConfig.user}`);
	console.log(`   SSL: ${envConfig.ssl}\n`);

	// Solicitar password desde variable de entorno o prompt
	let password = process.env.DB_PASSWORD || '';
	
	if (!password) {
		// Para Bun, usar prompt sincrónico simple
		// En producción, se recomienda usar variable de entorno
		console.log(`\n⚠️  Password not found in DB_PASSWORD environment variable.`);
		console.log(`   Please set it before running: export DB_PASSWORD=your_password\n`);
		throw new Error('Password is required. Set DB_PASSWORD environment variable.');
	}

	// Crear configuración completa del cliente
	const clientConfig = {
		host: envConfig.host,
		port: envConfig.port,
		database: envConfig.database,
		user: envConfig.user,
		password: password,
		applicationName: 'analyze-test',
		ssl: envConfig.ssl,
	};

	// Crear servicios
	const databaseAdapter = new BunDatabaseAdapter();
	const connectionService = new ConnectionService({ databaseAdapter });

	let connection: DatabaseConnection | null = null;

	try {
		// Crear conexión (usa pool internamente con postgres.js)
		console.log('🔌 Connecting to database...');
		connection = await connectionService.createConnection({
			config: clientConfig,
		});
		console.log('✅ Connected successfully\n');

		// Crear una tabla de prueba si no existe
		const testTableName = 'test_analyze_table';
		const testSchema = 'public';

		console.log(`📊 Creating test table: ${testSchema}.${testTableName}...`);
		await databaseAdapter.query({
			connection,
			sql: `
				CREATE TABLE IF NOT EXISTS "${testSchema}"."${testTableName}" (
					id SERIAL PRIMARY KEY,
					name TEXT,
					created_at TIMESTAMP DEFAULT NOW()
				);
			`,
		});
		console.log('✅ Test table created/verified\n');

		// Limpiar datos previos
		await databaseAdapter.query({
			connection,
			sql: `TRUNCATE TABLE "${testSchema}"."${testTableName}";`,
		});

		// 1. Verificar reltuples ANTES de insertar datos
		console.log('📈 Step 1: Checking reltuples BEFORE inserting data...');
		const beforeResults = await databaseAdapter.query<{
			reltuples: number;
			has_data: boolean;
		}>({
			connection,
			sql: `
				SELECT 
					COALESCE(c.reltuples, 0) as reltuples,
					COALESCE(c.reltuples, 0) > 0 as has_data
				FROM pg_class c
				JOIN pg_namespace n ON c.relnamespace = n.oid
				WHERE c.relkind = 'r'
					AND n.nspname = '${testSchema}'
					AND c.relname = '${testTableName}';
			`,
		});

		const beforeRelTuples = beforeResults[0]?.reltuples || 0;
		console.log(`   reltuples: ${beforeRelTuples}`);
		console.log(`   has_data: ${beforeResults[0]?.has_data || false}\n`);

		// 2. Insertar datos de prueba
		console.log('📝 Step 2: Inserting test data...');
		await databaseAdapter.query({
			connection,
			sql: `
				INSERT INTO "${testSchema}"."${testTableName}" (name)
				SELECT 'test_' || generate_series(1, 100);
			`,
		});

		// Verificar que los datos se insertaron
		const countResult = await databaseAdapter.query<{ count: string }>({
			connection,
			sql: `SELECT COUNT(*) as count FROM "${testSchema}"."${testTableName}";`,
		});
		const actualCount = parseInt(countResult[0]?.count || '0', 10);
		console.log(`   Inserted ${actualCount} rows\n`);

		// 3. Verificar reltuples DESPUÉS de insertar (sin ANALYZE)
		console.log('📈 Step 3: Checking reltuples AFTER insert (BEFORE ANALYZE)...');
		const afterInsertResults = await databaseAdapter.query<{
			reltuples: number;
			has_data: boolean;
		}>({
			connection,
			sql: `
				SELECT 
					COALESCE(c.reltuples, 0) as reltuples,
					COALESCE(c.reltuples, 0) > 0 as has_data
				FROM pg_class c
				JOIN pg_namespace n ON c.relnamespace = n.oid
				WHERE c.relkind = 'r'
					AND n.nspname = '${testSchema}'
					AND c.relname = '${testTableName}';
			`,
		});

		const afterInsertRelTuples = afterInsertResults[0]?.reltuples || 0;
		console.log(`   reltuples: ${afterInsertRelTuples}`);
		console.log(`   has_data: ${afterInsertResults[0]?.has_data || false}\n`);

		// 4. Ejecutar ANALYZE
		console.log('🔧 Step 4: Executing ANALYZE...');
		try {
			await databaseAdapter.query({
				connection,
				sql: `ANALYZE "${testSchema}"."${testTableName}";`,
			});
			console.log('✅ ANALYZE executed successfully\n');
		} catch (error) {
			console.error('❌ ANALYZE failed:', error);
			throw error;
		}

		// 5. Verificar reltuples DESPUÉS de ANALYZE
		console.log('📈 Step 5: Checking reltuples AFTER ANALYZE...');
		const afterAnalyzeResults = await databaseAdapter.query<{
			reltuples: number;
			has_data: boolean;
		}>({
			connection,
			sql: `
				SELECT 
					COALESCE(c.reltuples, 0) as reltuples,
					COALESCE(c.reltuples, 0) > 0 as has_data
				FROM pg_class c
				JOIN pg_namespace n ON c.relnamespace = n.oid
				WHERE c.relkind = 'r'
					AND n.nspname = '${testSchema}'
					AND c.relname = '${testTableName}';
			`,
		});

		const afterAnalyzeRelTuples = afterAnalyzeResults[0]?.reltuples || 0;
		console.log(`   reltuples: ${afterAnalyzeRelTuples}`);
		console.log(`   has_data: ${afterAnalyzeResults[0]?.has_data || false}\n`);

		// 6. Resumen y conclusiones
		console.log('📊 Summary:');
		console.log(`   Before insert: reltuples = ${beforeRelTuples}`);
		console.log(`   After insert (no ANALYZE): reltuples = ${afterInsertRelTuples}`);
		console.log(`   After ANALYZE: reltuples = ${afterAnalyzeRelTuples}`);
		console.log(`   Actual row count: ${actualCount}\n`);

		// Verificar si ANALYZE funcionó
		if (afterAnalyzeRelTuples > 0) {
			console.log('✅ SUCCESS: ANALYZE updated reltuples!');
			console.log(`   reltuples now shows: ${afterAnalyzeRelTuples} (actual: ${actualCount})`);
			console.log('   Pool connection can execute ANALYZE and update statistics.\n');
		} else {
			console.log('⚠️  WARNING: reltuples is still 0 after ANALYZE');
			console.log('   This might indicate:');
			console.log('   - ANALYZE requires superuser permissions');
			console.log('   - Pool connection has limited permissions');
			console.log('   - Statistics are not updated immediately\n');
		}

		// Limpiar tabla de prueba (opcional)
		console.log('🧹 Cleaning up test table...');
		await databaseAdapter.query({
			connection,
			sql: `DROP TABLE IF EXISTS "${testSchema}"."${testTableName}";`,
		});
		console.log('✅ Test table dropped\n');
	} catch (error) {
		console.error('❌ Test failed:', error);
		throw error;
	} finally {
		// Cerrar conexión
		if (connection) {
			await databaseAdapter.close({ connection });
			console.log('🔌 Connection closed');
		}
	}
}

// Ejecutar test si se llama directamente
if (import.meta.main) {
	// Permitir pasar el nombre del entorno como argumento
	const envName = process.argv[2] || undefined;
	
	testAnalyzeWithPool(envName)
		.then(() => {
			console.log('✨ Test completed');
			process.exit(0);
		})
		.catch((error) => {
			console.error('💥 Test failed:', error);
			process.exit(1);
		});
}

export { testAnalyzeWithPool };
