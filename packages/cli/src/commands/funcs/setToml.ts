import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getPackageJson } from '../../common';

export const setToml = (name: string, port: string) => {
    const pkJson = getPackageJson();

    pkJson.name = pkJson.name.split('-').at(-1);

    const basePath = resolve('supabase', 'config.toml');

    let config = readFileSync(basePath).toString();

    config = config.replaceAll('5432', port);

    if (name !== 'supa')
        config = config.replace(`project_id = "${pkJson.name}"`, `project_id = "${name}"`);

    writeFileSync(basePath, config);
};
