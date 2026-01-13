/**
 * Schemas de Zod para validación en el módulo de conexión.
 *
 * Define los schemas de Zod para validar parámetros de conexión.
 *
 * @module core/connection/domain/schemas/connection
 */

import { z } from 'zod';

/**
 * Schema para validar ConnectionParams.
 */
export const ConnectionParamsSchema = z.object({
	host: z.string().min(1, 'Host cannot be empty').trim(),
	port: z
		.number({
			message: 'Port must be a number',
		})
		.int('Port must be an integer')
		.min(1, 'Port must be between 1 and 65535')
		.max(65535, 'Port must be between 1 and 65535'),
	database: z.string().min(1, 'Database cannot be empty').trim(),
	user: z.string().min(1, 'User cannot be empty').trim(),
	password: z.string({
		message: 'Password must be a string',
	}),
	applicationName: z.string().min(1, 'Application name cannot be empty').trim(),
	ssl: z.boolean({
		message: 'SSL must be a boolean',
	}),
});

/**
 * Tipo inferido de ConnectionParamsSchema.
 */
export type ConnectionParamsInput = z.infer<typeof ConnectionParamsSchema>;
