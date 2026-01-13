import Bun from 'bun';
import fs from 'node:fs';
import { $ } from 'bun';

/**
 * Tipo de retorno del build de Bun.
 */
export type BuildOutput = Awaited<ReturnType<typeof Bun.build>>;

/**
 * Construye el paquete diff con tipado y minificación.
 *
 * Este build:
 * 1. Compila tipos TypeScript con tsc para generar declaraciones (.d.ts)
 * 2. Compila y minifica JavaScript usando Bun.build con minify: true
 * 3. No genera source maps
 * 4. Todo en el directorio dist/
 *
 * @returns Promise que resuelve con el resultado del build
 * @throws {Error} Si el build falla
 */
export async function build(): Promise<BuildOutput> {
	console.log('🚀 Iniciando build del paquete diff...');

	// 1. Limpiar directorio dist
	if (fs.existsSync('./dist')) {
		console.log('🧹 Limpiando directorio dist/...');
		fs.rmSync('./dist', { recursive: true, force: true });
	}
	fs.mkdirSync('./dist', { recursive: true });
	console.log('✅ Directorio dist/ preparado');

	// 2. Compilar tipos TypeScript con tsc (genera solo .d.ts)
	console.log('🔨 Compilando tipos TypeScript...');
	const tscResult = await $`bun run tsc --project tsconfig.build.json`.quiet();

	if (tscResult.exitCode !== 0) {
		console.error('❌ Error al compilar tipos TypeScript');
		process.exit(1);
	}
	console.log('✅ Tipos TypeScript compilados exitosamente');

	// 3. Compilar y minificar JavaScript usando Bun.build con minify: true
	console.log('📦 Compilando y minificando archivos JavaScript...');
	const buildResult = await Bun.build({
		entrypoints: ['./index.ts'],
		outdir: './dist',
		format: 'esm',
		minify: true,
		sourcemap: 'none',
		target: 'node',
	});

	if (!buildResult.success) {
		console.error('❌ Error al minificar archivos JavaScript');
		buildResult.logs.forEach((log) => {
			console.error(`   ${log.message}`);
		});
		throw new Error('Build failed', { cause: buildResult.logs });
	}

	console.log('✅ Archivos JavaScript minificados');
	console.log('✅ Build completado exitosamente');

	return buildResult;
}

build()
	.then(() => {
		console.log('OK ⚡');
	})
	.catch((error: unknown) => {
		console.error(error);
		console.error('❌ Error al construir el paquete');
		process.exit(1);
	})
	.finally(() => {
		console.log('🔄 Finalizando build...');
	});
