#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Parse command-line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    failOnUpdate: false,
    silent: true,
  };

  for (const arg of args) {
    if (arg === '--ci') {
      options.failOnUpdate = true;
      options.silent = true;
    } else if (arg === '--verbose' || arg === '--debug') {
      options.silent = false;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: i18n-check.js [options]

Options:
  --ci                  Enable CI mode
  --verbose, --debug    Enable verbose output
  -h, --help            Show this help message

Examples:
  ./i18n-check.js                    # Normal mode
  ./i18n-check.js --ci               # CI mode (strict)
  ./i18n-check.js --verbose          # Verbose output
`);
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${arg}`);
      console.log('Use --help to see available options');
      process.exit(1);
    }
  }

  return options;
}

function flattenObject(obj, prefix = '', res = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      flattenObject(value, newKey, res);
    } else {
      res[newKey] = value;
    }
  }
  return res;
}

function unflattenObject(flat) {
  const result = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

/**
 * Recursively list files under `dir` that match the pattern `.json`.
 * Returns list of full paths (or relative) to JSON files.
 */
async function listJsonFiles(dir) {
  let results = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    return results;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      const sub = await listJsonFiles(full);
      results = results.concat(sub);
    } else if (ent.isFile() && ent.name.endsWith('.json')) {
      results.push(full);
    }
  }
  return results;
}

async function unflattenAllJson(outputBase) {
  const jsonFiles = await listJsonFiles(outputBase);
  for (const file of jsonFiles) {
    try {
      const raw = await fs.readFile(file, 'utf8');
      const obj = JSON.parse(raw);
      const unflat = unflattenObject(obj);
      await fs.writeFile(file, JSON.stringify(unflat, null, 2) + '\n', 'utf8');
    } catch (err) {
      console.error(`Error unflattening ${file}:`, err.message);
    }
  }
}

async function flattenAllJson(outputBase) {
  const jsonFiles = await listJsonFiles(outputBase);
  for (const file of jsonFiles) {
    try {
      const raw = await fs.readFile(file, 'utf8');
      const obj = JSON.parse(raw);
      const flat = flattenObject(obj);
      await fs.writeFile(file, JSON.stringify(flat, null, 2) + '\n', 'utf8');
    } catch (err) {
      console.error(`Error flattening ${file}:`, err.message);
    }
  }
}

/**
 * Main flow:
 * 1. Unflatten all JSON files (i18next-parser expects nested structure)
 * 2. Run i18next parser
 * 3. Flatten all JSON files again (for easier runtime usage)
 */
async function main() {
  try {
    const options = parseArgs();
    const outputBase = path.resolve('src/translations');

    console.log('Step 1: Unflattening JSON files...');
    await unflattenAllJson(outputBase);
    console.log('Unflatten complete.\n');

    console.log('Step 2: Running i18next-parser...');

    // Build command with optional flags
    let parserCommand = 'npx i18next --config i18next-parser.config.js';
    if (options.failOnUpdate) {
      parserCommand += ' --fail-on-update';
    }
    if (options.silent) {
      parserCommand += ' --silent';
    }

    try {
      const { stdout, stderr } = await execAsync(parserCommand);
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
      console.log('Parser done.\n');
    } catch (err) {
      console.error('i18next-parser failed:');
      if (err.stdout) console.log(err.stdout);
      if (err.stderr) console.error(err.stderr);

      // Always flatten before exiting, even on error
      console.log('\nStep 3: Flattening JSON files (cleanup)...');
      await flattenAllJson(outputBase);
      console.log('Flatten complete.\n');

      if (options.failOnUpdate) {
        console.error('❌ Translation check failed');
        process.exit(1);
      } else {
        console.warn('⚠️  Parser had errors but continuing...\n');
      }
    }

    console.log('Step 3: Flattening JSON files...');
    await flattenAllJson(outputBase);
    console.log('Flatten complete.\n');

    console.log('✓ All done!');
  } catch (err) {
    console.error('Script error:', err);
    process.exit(1);
  }
}

main();
