#!/usr/bin/env node

import { Command } from 'commander';
import { getPackageJson } from './common';
import { InitCommand } from './commands/init';
import { OrmCommand } from './commands';
import { resolve } from 'node:path';
import { TypesCommand } from './commands/types';

const pkgJson = getPackageJson(resolve('node_modules', '@supabase-kit', 'cli', 'package.json'));

const program = new Command();

program.name(pkgJson.name).description('CLI to use @supabase-kit').version(pkgJson.version);

InitCommand(program);

OrmCommand(program);

TypesCommand(program);

program.parse();
