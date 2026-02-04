#!/usr/bin/env bun

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

interface WatchOptions {
    path: string;
    build: boolean;
}

function parseArguments(): WatchOptions {
    const args = process.argv.slice(2);
    let watchPath = './src/index.ts';
    let shouldBuild = false;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--build' || arg === '-b') {
            shouldBuild = true;
        } else if (!arg.startsWith('-')) {
            watchPath = arg;
        }
    }

    return { path: watchPath, build: shouldBuild };
}

function buildProject(): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log('--------------------------------');
        console.log('');
        console.info('🔄 Building project...');

        const buildProcess = spawn('bun', ['run', 'build'], {
            stdio: 'inherit',
            shell: true,
        });

        buildProcess.on('close', (code) => {
            if (code === 0) {
                console.info('✅ Build completed successfully');

                resolve();
            } else {
                console.error(`❌ Build failed with code ${code}`);
                reject(new Error(`Build failed with code ${code}`));
            }
        });
        console.log('--------------------------------');

        buildProcess.on('error', (error) => {
            console.error('❌ Build process error:', error.message);
            reject(error);
        });
    });
}

function startWatching(options: WatchOptions): void {
    const { path: watchPath, build } = options;

    // Resolve the absolute path
    const absolutePath = path.resolve(watchPath);

    // Check if the path exists
    if (!fs.existsSync(absolutePath)) {
        console.error(`❌ Error: Path "${absolutePath}" does not exist`);
        process.exit(1);
    }

    console.info(`👀 Watching for changes in: ${absolutePath}`);
    if (build) {
        console.info('🔨 Build mode enabled - will build on file changes');
    }
    console.info('Press Ctrl+C to stop watching\n');

    fs.watch(absolutePath, { recursive: true }, async (event, filename) => {
        if (event === 'change' && filename) {
            console.info(`📝 File changed: ${filename}`);

            if (build) {
                try {
                    await buildProject();
                } catch (error) {
                    console.error('Build failed:', error);
                }
            }
        }
    });
}

function showHelp(): void {
    console.info(`
🔧 Bunpack Watch Tool

Usage: bun run bunpack.watch.ts [path] [options]

Arguments:
  path                    Path to watch for changes (default: ./src/index.ts)

Options:
  -b, --build            Build the project when files change
  -h, --help             Show this help message

Examples:
  bun run bunpack.watch.ts
  bun run bunpack.watch.ts ./src
  bun run bunpack.watch.ts ./src --build
  bun run bunpack.watch.ts ./src -b
`);
}

function main(): void {
    const args = process.argv.slice(2);

    // Show help if requested
    if (args.includes('--help') || args.includes('-h')) {
        showHelp();
        return;
    }

    const options = parseArguments();
    startWatching(options);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.info('\n👋 Stopping watch process...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.info('\n👋 Stopping watch process...');
    process.exit(0);
});

main();
