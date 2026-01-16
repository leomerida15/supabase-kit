/**
 * Servicio para guardar archivos patch SQL.
 *
 * Proporciona funcionalidad para guardar scripts SQL generados
 * en archivos con formato timestamp y metadatos.
 *
 * @module core/patch/services/patch-file
 */

import { writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import type { CompareOptions } from '../../../types/config.types.js';

/**
 * Servicio para guardar archivos patch SQL.
 *
 * @class PatchFileService
 */
export class PatchFileService {
	/**
	 * Guarda un script SQL en un archivo patch.
	 *
	 * @param params - Parámetros para guardar el patch
	 * @param params.scriptLines - Líneas del script SQL a guardar
	 * @param params.config - Opciones de comparación
	 * @param params.scriptName - Nombre del script (sin extensión)
	 * @returns Promise que resuelve con la ruta del archivo guardado o null si no hay contenido
	 */
	public async savePatch(params: {
		scriptLines: string[];
		config: CompareOptions;
		scriptName: string;
	}): Promise<string | null> {
		const { scriptLines, config, scriptName } = params;

		if (scriptLines.length <= 0) {
			return null;
		}

		// Generar nombre de archivo con timestamp
		const now = new Date();
		const timestamp = now.toISOString().replace(/[-:.TZ]/g, '');
		const fileName = `${timestamp}_${scriptName}.sql`;

		// Resolver ruta del directorio de salida
		const outputDirectory = config.outputDirectory || '';
		const scriptPath = outputDirectory
			? resolve(outputDirectory, fileName)
			: resolve(process.cwd(), fileName);

		// Obtener autor
		let author = config.author || 'Unknown';
		if (config.getAuthorFromGit && !config.author) {
			author = await this.getGitAuthor();
		}

		// Generar metadatos
		const datetime = now.toISOString();
		const titleLength = Math.max(author.length, datetime.length);

		// Construir contenido del archivo
		const header = this.generateHeader(author, datetime, titleLength);
		const content = header + scriptLines.join('');

		// Asegurar que el directorio existe
		if (outputDirectory) {
			const { mkdir } = await import('fs/promises');
			try {
				await mkdir(outputDirectory, { recursive: true });
			} catch (error) {
				// El directorio puede ya existir, ignorar error
			}
		}

		// Escribir archivo
		await writeFile(scriptPath, content, 'utf-8');

		return scriptPath;
	}

	/**
	 * Genera el encabezado del archivo patch con metadatos.
	 * Usa comentarios válidos de PostgreSQL (--) en lugar de comentarios //.
	 *
	 * @param author - Nombre del autor
	 * @param datetime - Fecha y hora en formato ISO
	 * @param titleLength - Longitud para alinear el encabezado
	 * @returns Encabezado formateado
	 */
	private generateHeader(author: string, datetime: string, titleLength: number): string {
		const separator = '='.repeat(Math.max(50, titleLength + 26));
		return `-- ${separator}\n-- SCRIPT AUTHOR: ${author}\n-- CREATED ON: ${datetime}\n-- ${separator}\n\n`;
	}

	/**
	 * Obtiene el autor desde la configuración de Git.
	 * Intenta obtener primero desde configuración local, luego global.
	 *
	 * @returns Nombre del autor desde Git o 'Unknown'
	 */
	private async getGitAuthor(): Promise<string> {
		try {
			const { exec } = await import('child_process');
			const { promisify } = await import('util');
			const execAsync = promisify(exec);

			// Intentar obtener desde configuración local
			try {
				const { stdout } = await execAsync('git config --local user.name');
				const author = stdout.trim();
				if (author) {
					return author;
				}
			} catch {
				// Si falla, intentar global
			}

			// Intentar obtener desde configuración global
			try {
				const { stdout } = await execAsync('git config --global user.name');
				const author = stdout.trim();
				if (author) {
					return author;
				}
			} catch {
				// Si falla, retornar Unknown
			}

			return 'Unknown';
		} catch {
			return 'Unknown';
		}
	}
}
