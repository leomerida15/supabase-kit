import { resolve } from 'node:path';
import { Command } from 'commander';
import { existsSync, writeFileSync } from 'node:fs';
import { getPackageJson, PackageJson, setPackageJson } from '../../common';
import { getPkm } from '../funcs/getPkm';
import { getTemp } from '../funcs';
import { exec, execSync } from 'node:child_process';
import { parseToEnv } from './setEnvSupa';
import { Env } from '../funcs/Env';

export const MigrateCommand = (program: Command) => {
    const migrate = program.command('migrate').description('manager migrastions and db flow');

    migrate
        .command('init')
        .description('init migrations flow')
        .action(() => {
            try {
                const pkm = getPkm();

                const pkJson = PackageJson.get();

                if (pkm.file !== 'bun') execSync(`${pkm.i} ts-node -D`);

                pkJson.prisma = {
                    seed: pkm.seed,
                    import: {
                        schemas: 'supabase/schemas/**/*.prisma',
                    },
                    schema: 'supabase/schema.prisma',
                };

                pkJson.scripts[
                    'prisma:build'
                ] = `${pkm.pk} prisma-import --force --output supabase/schema.prisma`;

                PackageJson.set(pkJson);

                if (!existsSync(resolve('supabase', 'schemas')))
                    execSync('mkdir supabase/schemas', { stdio: 'pipe' });

                if (!existsSync(resolve('supabase', 'schemas', 'public'))) {
                    execSync('mkdir supabase/schemas/public', {
                        stdio: 'pipe',
                    });
                }

                if (!existsSync(resolve('supabase', 'schemas', 'helpers'))) {
                    execSync('mkdir supabase/schemas/helpers', {
                        stdio: 'pipe',
                    });
                }

                writeFileSync(
                    resolve('supabase', 'schemas', 'helpers', 'connections.prisma'),
                    getTemp().connect_helper_schema,
                );

                execSync(`${pkm.pk} prisma-import --force --output supabase/schema.prisma`, {
                    stdio: 'pipe',
                });

                if (!existsSync(resolve('supabase', 'seeds')))
                    execSync('mkdir supabase/seeds', { stdio: 'pipe' });

                if (!existsSync(resolve('supabase', 'seeds', 'index.ts')))
                    writeFileSync(resolve('supabase', 'seeds', 'index.ts'), '');

                const stdio = execSync(`${pkm.run} supabase start`, { stdio: 'pipe' });

                const supaEnvs = parseToEnv(stdio.toString());

                supaEnvs['DATABASE_URL'] = supaEnvs['DB_URL'];
                supaEnvs['DIRECT_URL'] = supaEnvs['DB_URL'];

                Env.set(supaEnvs);
            } catch (error) {
                const err = error as Error;

                console.error('Error:', err.message);
            }
        });
};
