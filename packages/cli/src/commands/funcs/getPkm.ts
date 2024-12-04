import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export const getPkm = () => {
    const pkms = {
        bun: {
            pk: 'bun',
            i: 'bun add',
            file: 'bun.lockb',
            seed: 'bun supabase/seeds/index.ts',
            run: 'bun',
        },
        npm: {
            pk: 'npm',
            i: 'npm i',
            file: 'package-lock.json',
            seed: 'ts-node supabase/seeds/index.ts',
            run: 'npm run',
        },
        yarn: {
            pk: 'yarn',
            i: 'yarn add',
            file: 'yarn.lock',
            seed: 'ts-node supabase/seeds/index.ts',
            run: 'yarn',
        },
        pnpm: {
            pk: 'pnpm',
            i: 'pnpm add',
            file: 'pnpm-lock.yaml',
            seed: 'ts-node supabase/seeds/index.ts',
            run: 'pnpm',
        },
    };

    const pkmSeartch = Object.values(pkms).find((p) => {
        const basePath = resolve(p.file);

        return existsSync(basePath);
    });

    if (!pkmSeartch) throw new Error('No package manager found');

    const pkm = (pkmSeartch?.pk || 'npm') as keyof typeof pkms;

    return pkms[pkm];
};
