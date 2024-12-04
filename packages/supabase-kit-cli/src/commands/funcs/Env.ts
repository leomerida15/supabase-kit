import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export class Env {
    static result: Record<string, string> = {};

    static toJson() {
        const envPath = resolve('.env');

        const envFile = readFileSync(envPath, 'utf-8');
        const lines = envFile.split('\n');
        const result: Record<string, string> = {};

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!(trimmedLine && !trimmedLine.startsWith('#'))) continue;

            const [key, value] = trimmedLine.split('=');
            if (key && value) {
                this.result[key.trim()] = value.trim();
            }
        }

        return result;
    }

    static get(key: string) {
        const envPath = resolve('.env');

        const envFile = readFileSync(envPath, 'utf-8');
        const lines = envFile.split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();

            if (!(trimmedLine && !trimmedLine.startsWith('#'))) continue;

            const [k, v] = trimmedLine.split('=');

            if (k && v && k === key) return v.trim();
        }

        return undefined;
    }

    static set(obj: Record<string, string>) {
        const envPath = resolve('.env');

        const envFile = existsSync(envPath) ? readFileSync(envPath, 'utf-8') : '';

        const NotExistingENVS = Object.entries(obj)
            .filter(
                ([k]) =>
                    !envFile
                        .split('\n')
                        .find((line) => line.includes(`${k}=`) && !line.includes('#')),
            )
            .map(([k, v]) => `${k}='${v}'`);

        const NewEnv = envFile
            .split('\n') // Dividir el texto en líneas
            .map<string>((line) => {
                if (!line.includes('=') || !line.includes('#')) return line;

                const [k] = line.split('=');

                if (!obj[k]) return line;

                return `${k}='${obj[k]}'`;
            })
            .concat(envFile.includes('# supabase local envs') ? [] : ['# supabase local envs'])
            .concat(NotExistingENVS)
            .join('\n');

        writeFileSync(envPath, NewEnv);
    }
}
