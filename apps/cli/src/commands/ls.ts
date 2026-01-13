/**
 * Comando para listar aplicaciones, entornos y comparaciones.
 *
 * @module cli/commands/ls
 */

import Enquirer from 'enquirer';
import { listApplications, getApplicationInfo, loadConfigFile } from '../utils/config.js';

/**
 * Maneja el comando ls para listar aplicaciones.
 *
 * @throws {Error} Si hay errores al listar aplicaciones
 */
export async function handleLsCommand(): Promise<void> {
    try {
        const applications = listApplications();

        if (applications.length === 0) {
            console.log('\n📋 No applications configured.\n');
            console.log('💡 Use the "add" command to create a new application.\n');
            return;
        }

        // Mostrar lista de aplicaciones para seleccionar
        const applicationChoices = applications.map((app) => ({ name: app, message: app }));

        const applicationAnswer = await Enquirer.prompt<{ applicationName: string }>({
            type: 'select',
            name: 'applicationName',
            message: 'Select an application to view details:',
            choices: applicationChoices,
        });

        const applicationName = applicationAnswer.applicationName;
        const appInfo = getApplicationInfo({ applicationName });
        const configFile = loadConfigFile({ applicationName });

        console.log(`\n📋 Application: ${applicationName}\n`);

        // Mostrar entornos
        console.log('🔹 Environments:');
        if (appInfo.entornos.length === 0) {
            console.log('   └── (none)\n');
        } else {
            appInfo.entornos.forEach((envName, index) => {
                const isLast = index === appInfo.entornos.length - 1;
                const prefix = isLast ? '└──' : '├──';
                const env = configFile.entornos[envName];

                if (!env) {
                    return;
                }

                console.log(`   ${prefix} ${envName}`);
                console.log(`   ${isLast ? '    ' : '│   '}    Host: ${env.host}`);
                console.log(`   ${isLast ? '    ' : '│   '}    Port: ${env.port}`);
                console.log(`   ${isLast ? '    ' : '│   '}    Database: ${env.database}`);
                console.log(`   ${isLast ? '    ' : '│   '}    User: ${env.user}`);
                console.log(`   ${isLast ? '    ' : '│   '}    SSL: ${env.ssl ? 'Yes' : 'No'}`);
                if (!isLast) {
                    console.log('');
                }
            });
            console.log('');
        }

        // Mostrar comparaciones
        console.log('🔹 Comparisons:');
        if (appInfo.comparaciones.length === 0) {
            console.log('   └── (none)\n');
        } else {
            appInfo.comparaciones.forEach((compName, index) => {
                const isLast = index === appInfo.comparaciones.length - 1;
                const prefix = isLast ? '└──' : '├──';
                const comp = configFile.comparaciones[compName];

                if (!comp) {
                    return;
                }

                console.log(`   ${prefix} ${compName}`);
                console.log(`   ${isLast ? '    ' : '│   '}    Source: ${comp.sourceClient}`);
                console.log(`   ${isLast ? '    ' : '│   '}    Target: ${comp.targetClient}`);
                console.log(`   ${isLast ? '    ' : '│   '}    Output: ${comp.compareOptions.outputDirectory}`);
                if (!isLast) {
                    console.log('');
                }
            });
            console.log('');
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error listing applications: ${error.message}`, { cause: error });
        }
        throw error;
    }
}
