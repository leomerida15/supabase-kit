import Bun from 'bun';
import fs from 'node:fs';

/**
 * Tipo de retorno del build de Bun.
 */
export type BuildOutput = Awaited<ReturnType<typeof Bun.build>>;

/**
 * Construye el bundle principal del CLI para Node.js.
 *
 * Este build genera solo archivos JavaScript (.js) sin declaraciones TypeScript (.d.ts).
 * El bundle resultante es compatible con Node.js y puede ejecutarse directamente.
 *
 * Realiza las siguientes operaciones:
 * 1. Construye el bundle principal usando Bun.build con target 'node'
 * 2. Copia el directorio access/ a dist/access/ si existe
 *
 * @returns Promise que resuelve con el resultado del build de Bun
 * @throws {Error} Si el build falla
 */
export async function build(): Promise<BuildOutput> {
    console.log('🚀 Iniciando build del CLI para Node.js...');

    // Ensure dist directory exists
    if (!fs.existsSync('./dist')) {
        fs.mkdirSync('./dist', { recursive: true });
        console.log('📁 Directorio dist/ creado');
    } else {
        console.log('📁 Directorio dist/ ya existe');
    }

    // Build the main bundle for Node.js
    console.log('🔨 Construyendo bundle principal para Node.js...');
    const buildResult = await Bun.build({
        entrypoints: ['./index.ts'],
        outdir: './dist',
        format: 'esm',
        minify: true,
        sourcemap: 'none',
        target: 'node',

        // Define environment
        define: {
            'process.env.NODE_ENV': '"production"',
        },
    });

    if (buildResult.success) {
        console.log('✅ Bundle principal construido exitosamente');
        console.log(`📦 ${buildResult.outputs.length} archivo(s) generado(s)`);
        buildResult.outputs.forEach((output) => {
            console.log(`   - ${output.path} (${output.kind})`);
        });

        // Agregar shebang para Node.js al archivo principal y hacerlo ejecutable
        const mainOutput = buildResult.outputs.find((output) => output.path.endsWith('index.js'));
        if (mainOutput) {
            try {
                const fileContent = await Bun.file(mainOutput.path).text();
                if (!fileContent.startsWith('#!/usr/bin/env node')) {
                    const newContent = `#!/usr/bin/env node\n${fileContent}`;
                    await Bun.write(mainOutput.path, newContent);

                    // Hacer el archivo ejecutable (chmod +x)
                    fs.chmodSync(mainOutput.path, 0o755);
                    console.log('✅ Shebang agregado y archivo hecho ejecutable');
                } else {
                    // Asegurar que el archivo sea ejecutable aunque ya tenga shebang
                    fs.chmodSync(mainOutput.path, 0o755);
                    console.log('✅ Archivo ya tiene shebang, permisos actualizados');
                }
            } catch (error: unknown) {
                console.warn('⚠️  Error al agregar shebang:', error);
            }
        }
    } else {
        console.error('❌ Error al construir el bundle principal');
        buildResult.logs.forEach((log) => {
            console.error(`   ${log.message}`);
        });
        throw new Error('Build failed', { cause: buildResult.logs });
    }

    // Copy access/prompts directory to dist/access/prompts for runtime access
    const accessSource: string = './access';
    const accessDest: string = './dist/access';
    try {
        if (fs.existsSync(accessSource)) {
            console.log('📋 Copiando directorio access/ a dist/access/...');
            // Ensure dist directory exists before copying
            if (!fs.existsSync('./dist')) {
                fs.mkdirSync('./dist', { recursive: true });
            }
            // Copy entire access directory
            fs.cpSync(accessSource, accessDest, { recursive: true });
            console.log('✅ Directorio access/ copiado exitosamente');
        } else {
            console.log('ℹ️  Directorio access/ no encontrado, omitiendo copia');
        }
    } catch (error: unknown) {
        console.error('❌ Error al copiar directorio access/:', error);
        throw new Error('Failed to copy access/ directory', { cause: error });
    }

    return buildResult;
}

build()
    .then(() => {
        console.log('OK ⚡');
    })
    .catch((error: unknown) => {
        console.error(error);
        console.error('❌ Error al construir el CLI');
        process.exit(1);
    })
    .finally(() => {
        console.log('🔄 Finalizando build del CLI...');
    });
