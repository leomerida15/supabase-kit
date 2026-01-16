/**
 * Servicio para leer y parsear archivos patch SQL.
 *
 * Proporciona funcionalidad para leer archivos patch del directorio
 * configurado y parsear bloques BEGIN/END.
 *
 * @module core/migration/services/patch-reader
 */

import { readdir, readFile } from 'fs/promises';
import { join, resolve } from 'path';
import type { PatchInfo } from '../domain/types/migration.types.js';
import { PatchInfoEntity } from '../domain/entities/patch-info.entity.js';

/**
 * Bloque de script SQL parseado de un archivo patch.
 *
 * @interface ParsedScriptBlock
 */
export interface ParsedScriptBlock {
	/**
	 * Etiqueta del bloque (extraída de --- BEGIN label ---).
	 */
	label: string;

	/**
	 * Líneas SQL del bloque.
	 */
	lines: string[];
}

/**
 * Contenido parseado de un archivo patch.
 *
 * @interface ParsedPatch
 */
export interface ParsedPatch {
	/**
	 * Información del patch.
	 */
	patchInfo: PatchInfo;

	/**
	 * Bloques de script parseados.
	 */
	blocks: ParsedScriptBlock[];

	/**
	 * Contenido completo del archivo (sin parsear).
	 */
	rawContent: string;
}

/**
 * Servicio para leer y parsear archivos patch SQL.
 *
 * @class PatchReaderService
 */
export class PatchReaderService {
	/**
	 * Lee todos los archivos patch del directorio configurado.
	 *
	 * @param patchesDirectory - Directorio donde se encuentran los patches
	 * @returns Lista de información de patches ordenados por nombre
	 */
	public async readPatchFiles(patchesDirectory: string): Promise<PatchInfo[]> {
		const resolvedPath = resolve(patchesDirectory);

		try {
			const files = await readdir(resolvedPath);
			const patchFiles = files
				.filter((file) => file.match(/.*\.(sql)/gi))
				.sort();

			const patchInfos: PatchInfo[] = [];

			for (const filename of patchFiles) {
				const patchInfo = this.parsePatchFilename(filename, resolvedPath);
				patchInfos.push(patchInfo);
			}

			return patchInfos;
		} catch (error) {
			throw new Error(`Failed to read patch files from directory: ${patchesDirectory}`, {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}

	/**
	 * Lee y parsea un archivo patch específico.
	 *
	 * @param patchInfo - Información del patch a leer
	 * @returns Contenido parseado del patch
	 */
	public async readPatch(patchInfo: PatchInfo): Promise<ParsedPatch> {
		const filePath = join(patchInfo.filepath, patchInfo.filename);

		try {
			const rawContent = await readFile(filePath, 'utf-8');
			const blocks = this.parseScriptBlocks(rawContent);

			return {
				patchInfo,
				blocks,
				rawContent,
			};
		} catch (error) {
			throw new Error(`Failed to read patch file: ${filePath}`, {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}

	/**
	 * Parsea el nombre de archivo para extraer información del patch.
	 *
	 * @param filename - Nombre del archivo
	 * @param filepath - Ruta del directorio
	 * @returns Información del patch
	 * @throws {Error} Si el formato del nombre no es válido
	 */
	private parsePatchFilename(filename: string, filepath: string): PatchInfo {
		const indexOfSeparator = filename.indexOf('_');

		if (indexOfSeparator < 0 || !/^\d+$/.test(filename.substring(0, indexOfSeparator))) {
			throw new Error(
				`The patch file name ${filename} is not compatible with conventioned pattern {version}_{path name}.sql !`,
			);
		}

		const version = filename.substring(0, indexOfSeparator);
		const name = filename.substring(indexOfSeparator + 1).replace('.sql', '');

		return new PatchInfoEntity({
			filename,
			filepath,
			version,
			name,
		});
	}

	/**
	 * Normaliza comentarios SQL de estilo JavaScript (//) a formato PostgreSQL (--).
	 * PostgreSQL solo acepta comentarios con -- o 
	 *
	 * @param line - Línea de SQL a normalizar
	 * @returns Línea con comentarios normalizados
	 */
	private normalizeSqlComments(line: string): string {
		// Convertir comentarios // a --
		// Solo convertir si la línea empieza con // o tiene // al inicio (después de espacios)
		return line.replace(/^(\s*)\/\//, '$1--');
	}

	/**
	 * Parsea bloques de script desde el contenido del archivo.
	 * Busca bloques marcados con --- BEGIN label --- y --- END label ---.
	 * Si no encuentra marcadores, trata todo el contenido como un único bloque.
	 *
	 * @param content - Contenido del archivo
	 * @returns Bloques de script parseados
	 */
	private parseScriptBlocks(content: string): ParsedScriptBlock[] {
		const blocks: ParsedScriptBlock[] = [];
		const lines = content.split('\n');

		let currentBlock: ParsedScriptBlock | null = null;
		const beginPattern = /^---\s+BEGIN\s+(.+?)\s+---$/;
		const endPattern = /^---\s+END\s+(.+?)\s+---$/;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line === undefined) {
				continue;
			}
			const beginMatch = line.match(beginPattern);
			const endMatch = line.match(endPattern);

			if (beginMatch && beginMatch[1]) {
				// Inicio de un nuevo bloque
				if (currentBlock) {
					// Guardar bloque anterior si existe
					blocks.push(currentBlock);
				}
				currentBlock = {
					label: beginMatch[1].trim(),
					lines: [],
				};
			} else if (endMatch && currentBlock) {
				// Fin del bloque actual
				blocks.push(currentBlock);
				currentBlock = null;
			} else if (currentBlock) {
				// Línea dentro del bloque - normalizar comentarios
				currentBlock.lines.push(this.normalizeSqlComments(line));
			}
		}

		// Agregar último bloque si existe
		if (currentBlock) {
			blocks.push(currentBlock);
		}

		// Si no se encontraron bloques con marcadores BEGIN/END,
		// tratar todo el contenido como un único bloque
		if (blocks.length === 0 && lines.length > 0) {
			// Filtrar líneas vacías al inicio y final
			const trimmedLines = lines.filter((line, index) => {
				const trimmed = line.trim();
				// Incluir todas las líneas excepto líneas completamente vacías al inicio
				if (trimmed.length === 0 && index === 0) {
					return false;
				}
				return true;
			});

			// Remover líneas vacías al final
			while (trimmedLines.length > 0 && trimmedLines[trimmedLines.length - 1]?.trim().length === 0) {
				trimmedLines.pop();
			}

			if (trimmedLines.length > 0) {
				// Normalizar comentarios en todas las líneas del bloque único
				const normalizedLines = trimmedLines.map((line) => this.normalizeSqlComments(line));
				blocks.push({
					label: 'main',
					lines: normalizedLines,
				});
			}
		}

		return blocks;
	}
}
