import { join } from 'node:path';
import { Command } from 'commander';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const getPkm = () => {
    const pkms = {
        npm: { pk: 'npm', i: 'npm i', file: 'package-lock.json' },
        bun: { pk: 'bun', i: 'bun add', file: 'bun.lockb' },
        yarn: { pk: 'yarn', i: 'yarn add', file: 'yarn.lock' },
        pnpm: { pk: 'pnpm', i: 'pnpm add', file: 'pnpm-lock.yaml' },
    };

    const pkmSeartch = Object.values(pkms).find((p) => {
        const basePath = join(p.file);

        return existsSync(basePath);
    });

    const pkm = (pkmSeartch?.pk || 'npm') as keyof typeof pkms;

    return pkms[pkm];
};

export const InitCommand = (program: Command) => {
    program
        .command('init')
        .description('Init proyect')
        .action(async () => {
            const pkm = getPkm();

            execSync('bun supabase functions new example', { stdio: 'pipe' });
            execSync('cd supabase/functions -- exit && deno init', { stdio: 'pipe' });
            unlinkSync(join('supabase', 'functions', 'main.ts'));
            execSync(
                'cd supabase/functions -- exit && deno add npm:@rocket-kit/edge jsr:@supabase/functions-js',
                { stdio: 'pipe' },
            );
            writeFileSync(
                join('supabase', 'functions', 'example', 'index.ts'),
                readFileSync(join('src', 'commands', 'funcs', 'example.txt')).toString(),
            );

            execSync(`${pkm.i} @rocket-kit/edge prisma @supabase/supabase-js`, { stdio: 'pipe' });

            execSync(`${pkm.i} prisma-import -D`, { stdio: 'pipe' });
        });
};
