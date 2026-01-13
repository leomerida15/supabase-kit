// Importar los plugins
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
import tanstackQuery from '@tanstack/eslint-plugin-query';

export default tseslint.defineConfig(
	// Configuración para los plugins
	{
		plugins: {
			'react-hooks': reactHooks,
			'@next/next': nextPlugin,
			'@tanstack/query': tanstackQuery,
		},
		rules: {
			// Desactivar regla de curly
			curly: 'off',
		},
	},
	{ ignores: ['**/*.{mjs,cjs,js,d.ts,d.mts}'] },
	{
		files: ['**/*.story.tsx'],
		rules: {
			'no-console': 'off',
			'object-curly-spacing': 'off',
			// Desactivar reglas específicas para stories
			'@next/next/no-html-link-for-pages': 'off',
		},
	},
);
