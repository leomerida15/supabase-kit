/**
 * Get Package.json file.
 *
 * Read a package json file
 *
 * @author Awais <https://twitter.com/MrAhmadAwais/>
 */

import { readFileSync } from 'fs';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export class PackageJson {
    static get(customPath?: string) {
        const packagePath = customPath || resolve('package.json');
        try {
            const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
            return packageJson;
        } catch (error) {
            console.error(`Error reading package.json from ${packagePath}:`, error);
            throw error;
        }
    }

    static set(data: Record<string, any>, customPath?: string) {
        const packagePath = customPath || resolve('package.json');
        try {
            writeFileSync(packagePath, JSON.stringify(data, null, 2), 'utf-8');
        } catch (error) {
            console.error(`Error reading package.json from ${packagePath}:`, error);
            throw error;
        }
    }
}

export function getPackageJson(customPath?: string) {
    const packagePath = customPath || resolve('package.json');
    try {
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
        return packageJson;
    } catch (error) {
        console.error(`Error reading package.json from ${packagePath}:`, error);
        throw error;
    }
}

export function setPackageJson(data: Record<string, any>, customPath?: string) {
    const packagePath = customPath || resolve('package.json');
    try {
        writeFileSync(packagePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error reading package.json from ${packagePath}:`, error);
        throw error;
    }
}
