/**
 * Tests unitarios para generateCreateRLSPolicyScript
 * 
 * Valida que las políticas RLS se generen correctamente según el tipo de comando:
 * - INSERT debe usar WITH CHECK
 * - SELECT/UPDATE/DELETE deben usar USING
 * - ALL debe usar ambas cláusulas
 * 
 * @module test/diff/sql-generator-rls-policy
 */

import { describe, test, expect } from 'bun:test';
import { generateCreateRLSPolicyScript } from '../../packages/diff/src/core/comparison/services/sql-generator/sql-generator.utils.js';

describe('generateCreateRLSPolicyScript', () => {
	describe('INSERT policies', () => {
		test('debe generar WITH CHECK para políticas INSERT', () => {
			const result = generateCreateRLSPolicyScript(
				'ai',
				'tasks',
				'Enable insert for all users',
				'INSERT',
				'true',
				['anon', 'authenticated'],
				false,
			);

			expect(result).toContain('WITH CHECK (true)');
			expect(result).not.toContain('USING (true)');
			expect(result).toContain('FOR INSERT');
		});

		test('debe generar WITH CHECK incluso cuando command está en minúsculas', () => {
			const result = generateCreateRLSPolicyScript(
				'ai',
				'tasks',
				'Enable insert for all users',
				'insert',
				'true',
				[],
				false,
			);

			expect(result).toContain('WITH CHECK (true)');
			expect(result).not.toContain('USING (true)');
		});

		test('debe envolver en DO block con verificación cuando useOrReplace = false', () => {
			const result = generateCreateRLSPolicyScript(
				'ai',
				'tasks',
				'Enable insert for all users',
				'INSERT',
				'true',
				['anon', 'authenticated'],
				false,
			);

			expect(result).toContain('DO $$');
			expect(result).toContain('IF NOT EXISTS');
			expect(result).toContain('pg_policies');
			expect(result).toContain("schemaname = 'ai'");
			expect(result).toContain("tablename = 'tasks'");
			expect(result).toContain("policyname = 'Enable insert for all users'");
		});
	});

	describe('SELECT policies', () => {
		test('debe generar USING para políticas SELECT', () => {
			const result = generateCreateRLSPolicyScript(
				'ai',
				'tasks',
				'Enable select for all users',
				'SELECT',
				'true',
				['anon', 'authenticated'],
				false,
			);

			expect(result).toContain('USING (true)');
			expect(result).not.toContain('WITH CHECK');
			expect(result).toContain('FOR SELECT');
		});
	});

	describe('UPDATE policies', () => {
		test('debe generar USING para políticas UPDATE', () => {
			const result = generateCreateRLSPolicyScript(
				'ai',
				'tasks',
				'Enable update for all users',
				'UPDATE',
				'true',
				['anon', 'authenticated'],
				false,
			);

			expect(result).toContain('USING (true)');
			expect(result).not.toContain('WITH CHECK');
			expect(result).toContain('FOR UPDATE');
		});
	});

	describe('DELETE policies', () => {
		test('debe generar USING para políticas DELETE', () => {
			const result = generateCreateRLSPolicyScript(
				'ai',
				'tasks',
				'Enable delete for all users',
				'DELETE',
				'true',
				['anon', 'authenticated'],
				false,
			);

			expect(result).toContain('USING (true)');
			expect(result).not.toContain('WITH CHECK');
			expect(result).toContain('FOR DELETE');
		});
	});

	describe('ALL policies', () => {
		test('debe generar ambas cláusulas (USING y WITH CHECK) para políticas ALL', () => {
			const result = generateCreateRLSPolicyScript(
				'ai',
				'tasks',
				'Enable all for all users',
				'ALL',
				'true',
				['anon', 'authenticated'],
				false,
			);

			expect(result).toContain('USING (true)');
			expect(result).toContain('WITH CHECK (true)');
			expect(result).toContain('FOR ALL');
		});

		test('debe usar la misma definición para ambas cláusulas en ALL', () => {
			const result = generateCreateRLSPolicyScript(
				'ai',
				'tasks',
				'Enable all for all users',
				'ALL',
				'user_id = auth.uid()',
				[],
				false,
			);

			expect(result).toContain('USING (user_id = auth.uid())');
			expect(result).toContain('WITH CHECK (user_id = auth.uid())');
		});
	});

	describe('CREATE OR REPLACE', () => {
		test('debe usar CREATE OR REPLACE POLICY cuando useOrReplace = true', () => {
			const result = generateCreateRLSPolicyScript(
				'ai',
				'tasks',
				'Enable insert for all users',
				'INSERT',
				'true',
				['anon', 'authenticated'],
				true,
			);

			expect(result).toContain('CREATE OR REPLACE POLICY');
			expect(result).not.toContain('DO $$');
			expect(result).not.toContain('IF NOT EXISTS');
			expect(result).toContain('WITH CHECK (true)');
		});
	});

	describe('Normalización de definición vacía', () => {
		test('debe normalizar definición vacía a true', () => {
			const result = generateCreateRLSPolicyScript(
				'ai',
				'tasks',
				'Enable insert for all users',
				'INSERT',
				'',
				[],
				false,
			);

			expect(result).toContain('WITH CHECK (true)');
			expect(result).not.toContain('WITH CHECK ()');
		});

		test('debe normalizar definición con solo paréntesis a true', () => {
			const result = generateCreateRLSPolicyScript(
				'ai',
				'tasks',
				'Enable insert for all users',
				'INSERT',
				'()',
				[],
				false,
			);

			expect(result).toContain('WITH CHECK (true)');
			expect(result).not.toContain('WITH CHECK ()');
		});
	});

	describe('Escapado de valores para SQL injection', () => {
		test('debe escapar comillas simples en schema, tableName y policyName', () => {
			const result = generateCreateRLSPolicyScript(
				"ai'",
				"tasks'",
				"Enable insert' for all users",
				'INSERT',
				'true',
				[],
				false,
			);

			// Verificar que las comillas simples están escapadas en la consulta pg_policies
			expect(result).toContain("schemaname = 'ai''");
			expect(result).toContain("tablename = 'tasks''");
			expect(result).toContain("policyname = 'Enable insert'' for all users'");
		});

		test('debe escapar comillas dobles en policyName dentro de EXECUTE', () => {
			const result = generateCreateRLSPolicyScript(
				'ai',
				'tasks',
				'Policy with "quotes"',
				'INSERT',
				'true',
				[],
				false,
			);

			// El nombre de la política en EXECUTE debe tener comillas dobles escapadas
			expect(result).toContain('CREATE POLICY "Policy with ""quotes"""');
		});
	});

	describe('Delimitadores en DO block y EXECUTE', () => {
		test('debe usar delimitador diferente en EXECUTE para evitar conflicto con DO block', () => {
			const result = generateCreateRLSPolicyScript(
				'ai',
				'tasks',
				'Test policy',
				'INSERT',
				'true',
				[],
				false,
			);

			// Verificar que el EXECUTE usa $policy$ y no $$
			expect(result).toContain('EXECUTE $policy$');
			expect(result).toContain('$policy$;');
			// Verificar que el bloque DO sigue usando $$
			expect(result).toContain('DO $$');
			expect(result).toContain('END $$;');
			// Verificar que no hay conflicto: el EXECUTE no debe usar $$ dentro del bloque DO
			const executeMatch = result.match(/EXECUTE\s+(\$[^$]+\$)/);
			expect(executeMatch).not.toBeNull();
			expect(executeMatch![1]).toBe('$policy$');
		});
	});

	describe('Roles', () => {
		test('debe incluir cláusula TO cuando hay roles', () => {
			const result = generateCreateRLSPolicyScript(
				'ai',
				'tasks',
				'Enable insert for all users',
				'INSERT',
				'true',
				['anon', 'authenticated'],
				false,
			);

			expect(result).toContain(' TO anon, authenticated');
		});

		test('no debe incluir cláusula TO cuando no hay roles', () => {
			const result = generateCreateRLSPolicyScript(
				'ai',
				'tasks',
				'Enable insert for all users',
				'INSERT',
				'true',
				[],
				false,
			);

			expect(result).not.toContain(' TO ');
		});
	});
});
