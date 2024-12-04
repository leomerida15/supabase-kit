import { Command } from 'commander';
import { PackageJson } from '../../common';
import { getPkm } from '../funcs/getPkm';
import { exec, execSync } from 'child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getTemp } from '../funcs';
import { Env } from '../funcs/Env';

export const TypesCommand = (program: Command) => {
    const Types = program
        .command('types')
        .description(
            'Basic commands to generate types based on the DB, we recommend using Supabase CLI directly for greater optimization',
        );

    Types.command('init')
        .description('create folder structure and generate types basic by typescript')
        .option(
            '-o, --origin <char>',
            'db orign loccal or remote, by remote use the var DATABASE_URL in your .env file',
            'local',
        )
        .action((str) => {
            try {
                const pkm = getPkm();

                const pkJson = PackageJson.get();

                if (!pkJson.devDependencies['type-fest'])
                    execSync(`${pkm.i} type-fest -D`, { stdio: 'pipe' });

                if (!existsSync(resolve('supabase', 'types'))) {
                    execSync('mkdir supabase/types', { stdio: 'pipe' });
                }

                if (!existsSync(resolve('supabase', 'types', 'database.types.ts'))) {
                    writeFileSync(
                        resolve('supabase', 'types', 'database.types.ts'),
                        getTemp().base_types,
                    );
                }

                execSync(`${pkm.run} supa types pull -o ${str.origin}`, { stdio: 'pipe' });
            } catch (error) {
                const err = error as Error;

                console.error('Error:', err.message);
            }
        });

    Types.command('pull')
        .description('getting and generate types by typescript from your database')
        .option(
            '-o, --origin <char>',
            'db orign loccal or remote, by remote use the var DATABASE_URL in your .env file',
            'local',
        )
        .action((str) => {
            try {
                const pkm = getPkm();

                if (str.origin === 'local') {
                    execSync(
                        `${pkm.run} supabase gen types --lang=typescript --local -s public > supabase/types/database-generated.local.type.ts`,
                        {
                            stdio: 'pipe',
                        },
                    );
                } else {
                    const DATABASE_URL = Env.get('DATABASE_URL');

                    execSync(
                        `${pkm.run} supabase gen types --lang=typescript  --db-url '${DATABASE_URL}' -s public > supabase/types/database-generated.serve.type.ts`,
                        {
                            stdio: 'pipe',
                        },
                    );
                }
            } catch (error) {
                const err = error as Error;

                console.error('Error:', err.message);
            }
        });
};
