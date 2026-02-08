import Bun from 'bun';
import fs from 'node:fs';

const timetaken = 'complete build';

// Starts the timer, the label value is timetaken
console.time(timetaken);

// Build the main bundle
Bun.build({
    minify: true, 
    format: 'esm',
    outdir: './dist',
    splitting: false,
    target: 'browser',
    entrypoints: ['./src/index.ts'],
    // Optimizations for smallest bundle size
    // Define environment
    define: {
        'process.env.NODE_ENV': '"production"',
    },
    // External dependencies
    external: ['react', 'react-dom', '@supabase/supabase-js', '@tanstack/react-query'],
})
    .then(() => {
        console.log('✅ Main bundle built successfully');
        console.log('📦 Bundle optimized for minimum size');

        // Clean TypeScript build cache to ensure fresh generation
        const buildInfoPath = './node_modules/.tmp/tsconfig.build.tsbuildinfo';
        try {
            fs.unlinkSync(buildInfoPath);
            console.log('🧹 TypeScript build cache cleaned');
        } catch (error) {
            // Cache file doesn't exist, which is fine
        }

        // Generate TypeScript declarations using the specific config
        return Bun.spawn(['bun', 'x', 'tsc', '--project', 'tsconfig.build.json']);
    })
    .then((result) => {
        // Check if the process completed successfully
        if (result.exitCode === 0 || result.exitCode === null) {
            console.log('✅ TypeScript declarations generated');
        } else {
            console.error('❌ TypeScript declarations generation failed');
            console.error('Exit code:', result.exitCode);
        }
    })
    .catch((err) => {
        console.error('❌ Build failed:', err);
        process.exit(1);
    })
    .finally(() => {
        console.timeEnd(timetaken);
    });
