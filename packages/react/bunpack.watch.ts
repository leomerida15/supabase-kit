import fs from 'node:fs'

fs.watch('src/index.ts', { recursive: true }, (event) => {
    if (event === 'change' || event === 'rename') {
        Bun.spawn(['bun', 'run', 'build']);
    }
});