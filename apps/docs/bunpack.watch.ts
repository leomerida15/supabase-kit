import { watch } from 'node:fs'

const onServer = () => {
    const command = ['bun', 'run', '--bun', 'docsify', 'serve'];
    Bun.spawn(command);
    console.log(command.join(' '));
};

/** Regenera llm.md (empaquetado para IA) cuando cambian views o README. */
const buildLlm = (sync = false) => {
    const opts = {
        cmd: ['bun', 'run', 'build-llm.ts'] as const,
        cwd: import.meta.dir,
        stdout: 'inherit' as const,
        stderr: 'inherit' as const,
    };
    if (sync) {
        const proc = Bun.spawnSync(opts);
        if (proc.exitCode !== 0) console.error('build-llm.ts salió con código', proc.exitCode);
    } else {
        const proc = Bun.spawn(opts);
        proc.exited.then((code) => {
            if (code !== 0) console.error('build-llm.ts salió con código', code);
        });
    }
};

// Archivos que disparan rebuild del servidor y/o de llm.md
const RELEVANT = /^(index\.ts|README\.md|_sidebar\.md|index\.html|views\/.*\.md)$/
const TRIGGERS_LLM = /^(README\.md|views\/.*\.md)$/;

const onRelevantChange = (filename: string) => {
    if (TRIGGERS_LLM.test(filename)) buildLlm(false);
    onServer();
};

buildLlm(true); // Genera llm.md al arrancar antes de levantar el servidor
onServer();

watch('.', { recursive: true }, (event: string, filename: string | null) => {
    if ((event === 'change' || event === 'rename') && filename && RELEVANT.test(filename)) {
        onRelevantChange(filename);
    }
});