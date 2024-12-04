import { Command } from 'commander';
import { getPkm } from '../funcs/getPkm';
import { setToml } from '../funcs/setToml';
import { exec, execSync } from 'node:child_process';

export const InitCommand = (program: Command) => {
    program
        .command('init')
        .description('Init project')
        .option('-n, --name <char>', 'name project', 'supa')
        .option(
            '-pf --port_family <numbers>',
            'port family by docker container for local dev',
            '5432',
        )
        .option('-fm, --framework <react | next>', 'extra tools by framework')
        .action(async (str) => {
            try {
                const pkm = getPkm();

                exec(`${pkm.i} prisma-import supabase -D`);
                exec(`${pkm.i} prisma @supabase/supabase-js`);

                // Ejecuta 'supabase init' de manera sincrónica
                execSync(`${pkm.run} supabase init`, { stdio: 'pipe' });

                // Configura el archivo toml
                setToml(str.name, str.port_family);

                if (['react', 'next'].includes(str.framework)) {
                    execSync(`${pkm.i}  @tanstack/react-query @supabase-kit/react`, {
                        stdio: 'pipe',
                    });

                    if (str.framework === 'next') {
                        execSync(`${pkm.i} @next-hooks/use-urls @supabase/ssr`, {
                            stdio: 'pipe',
                        });
                    }
                }
            } catch (errorr) {
                const err = errorr as Error;

                console.error('Error al ejecutar supabase init:', err.message);
            }
        });
};
