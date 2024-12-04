import { resolve } from 'node:path';
import { Command } from 'commander';
import { existsSync, writeFileSync } from 'node:fs';
import { getPackageJson, PackageJson, setPackageJson } from '../../common';
import { getPkm } from '../funcs/getPkm';
import { getTemp } from '../funcs';
import { exec, execSync } from 'node:child_process';
import { parseToEnv } from './setEnvSupa';
import { Env } from '../funcs/Env';

export const OrmCommand = (program: Command) => {
    const migrate = program.command('orm').description('basic init orm and db flow');

    migrate
        .command('init')
        .description('init orm db flow')
        .action(() => {
            try {
                const pkm = getPkm();

                const pkJson = PackageJson.get();

                if (pkm.file !== 'bun') execSync(`${pkm.i} ts-node -D`);

                pkJson.prisma = {
                    seed: pkm.seed,
                    schema: 'supabase/schema.prisma',
                };

                PackageJson.set(pkJson);

                if (!existsSync(resolve('supabase', 'schemas')))
                    execSync('mkdir supabase/schemas', { stdio: 'pipe' });

                if (!existsSync(resolve('supabase', 'seeds')))
                    execSync('mkdir supabase/seeds', { stdio: 'pipe' });

                if (!existsSync(resolve('supabase', 'seeds', 'index.ts')))
                    writeFileSync(resolve('supabase', 'seeds', 'index.ts'), 'export const Seeds = (async ()=>{})();');

                const stdio = execSync(`${pkm.run} supabase start`, { stdio: 'pipe' });

                const supaEnvs = parseToEnv(stdio.toString());

                supaEnvs.set('DATABASE_URL', supaEnvs.get('DB_URL')!);
                supaEnvs.set('DIRECT_URL', supaEnvs.get('DB_URL')!);

                Env.set(supaEnvs);
            } catch (error) {
                const err = error as Error;

                console.error('Error:', err.message);
            }
        });
};
