import fs from 'node:fs';
import path from 'node:path';
import { $ } from 'bun';

/**
 * Script de watch que monitorea cambios en los archivos fuente y ejecuta el build automáticamente.
 */
const WATCH_DIRS = ['./src', './index.ts'];
const DEBOUNCE_MS = 500; // Esperar 500ms después del último cambio antes de construir

let buildTimeout: Timer | null = null;
let isBuilding = false;

/**
 * Ejecuta el build con debounce para evitar builds múltiples rápidos.
 */
async function triggerBuild(changedFile: string): Promise<void> {
	// Cancelar build pendiente si existe
	if (buildTimeout) {
		clearTimeout(buildTimeout);
	}

	// Esperar un poco antes de construir (debounce)
	buildTimeout = setTimeout(async () => {
		if (isBuilding) {
			console.log('⏳ Build ya en progreso, esperando...');
			return;
		}

		isBuilding = true;
		console.log(`\n📝 Cambio detectado en: ${changedFile}`);
		console.log('🔄 Ejecutando build...');
		
		try {
		const result = await $`bun run build`.quiet();
		
		if (result.exitCode === 0) {
			console.log('✅ Build completado exitosamente\n');
		} else {
			console.error('❌ Error en el build\n');
		}
		} catch (error) {
			console.error('❌ Error al ejecutar build:', error);
		} finally {
			isBuilding = false;
		}
	}, DEBOUNCE_MS);
}

console.log('👀 Monitoreando cambios en archivos fuente...');
console.log('🔄 Ejecutando build inicial...');

// Ejecutar build inicial
try {
	const initialBuild = await $`bun run build`.quiet();
	if (initialBuild.exitCode === 0) {
		console.log('✅ Build inicial completado\n');
	} else {
		console.error('❌ Error en el build inicial\n');
	}
} catch (error) {
	console.error('❌ Error al ejecutar build inicial:', error);
}

// Monitorear cambios en directorios y archivos
for (const watchPath of WATCH_DIRS) {
	try {
		const stats = fs.statSync(watchPath);
		
		if (stats.isDirectory()) {
			// Monitorear directorio recursivamente
			fs.watch(watchPath, { recursive: true }, async (eventType, filename) => {
				if (filename && (eventType === 'change' || eventType === 'rename')) {
					const fullPath = path.join(watchPath, filename);
					// Ignorar archivos temporales y de sistema
					if (!filename.includes('~') && !filename.startsWith('.')) {
						await triggerBuild(fullPath);
					}
				}
			});
			console.log(`✅ Monitoreando directorio: ${watchPath}`);
		} else if (stats.isFile()) {
			// Monitorear archivo individual
			fs.watch(watchPath, { recursive: false }, async (eventType) => {
				if (eventType === 'change') {
					await triggerBuild(watchPath);
				}
			});
			console.log(`✅ Monitoreando archivo: ${watchPath}`);
		}
	} catch (error) {
		console.warn(`⚠️  No se pudo monitorear ${watchPath}:`, error);
	}
}

console.log('✅ Watch activo. Presiona Ctrl+C para detener.');

