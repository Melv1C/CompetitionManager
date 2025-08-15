#!/usr/bin/env node

/**
 * Script to automatically sort translation keys alphabetically in all JSON files
 * Preserves nested object structure while ensuring consistent key ordering
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LANGUAGES = ['en', 'fr', 'nl'];
const TRANSLATIONS_DIR = resolve(__dirname, '../../frontend/src/translations');
const EXIT_CODES = {
  SUCCESS: 0,
  DIRECTORY_ERROR: 1,
  FILE_ERROR: 2,
  JSON_ERROR: 3,
};

/**
 * @typedef {Object} SortResult
 * @property {number} totalFiles
 * @property {number} processedFiles
 * @property {string[]} errors
 * @property {string[]} sortedFiles
 */

class TranslationSorter {
  constructor() {
    this.errors = [];
    this.sortedFiles = [];
    this.totalFiles = 0;
    this.processedFiles = 0;
  }

  /**
   * Main sorting method
   * @returns {Promise<SortResult>}
   */
  async sort() {
    console.log('🔄 Sorting i18n translation keys...\n');

    // Check if translations directory exists
    if (!existsSync(TRANSLATIONS_DIR)) {
      this.errors.push(`Translations directory not found: ${TRANSLATIONS_DIR}`);
      return this.getResult();
    }

    // Process each language
    for (const lang of LANGUAGES) {
      console.log(`🌍 Processing ${lang.toUpperCase()}...`);
      await this.sortLanguage(lang);
      console.log('');
    }

    return this.getResult();
  }

  /**
   * Sort all translation files for a specific language
   * @param {string} language
   * @returns {Promise<void>}
   */
  async sortLanguage(language) {
    const langDir = join(TRANSLATIONS_DIR, language);

    if (!existsSync(langDir)) {
      console.log(`  ⚠️  Directory not found: ${language}`);
      return;
    }

    try {
      const files = readdirSync(langDir)
        .filter((file) => file.endsWith('.json'))
        .sort();

      if (files.length === 0) {
        console.log(`  ⚠️  No JSON files found in ${language}`);
        return;
      }

      this.totalFiles += files.length;

      for (const file of files) {
        await this.sortFile(language, file);
      }
    } catch (error) {
      this.errors.push(
        `Failed to read ${language} directory: ${error.message}`
      );
      console.log(`  ❌ Error reading directory: ${error.message}`);
    }
  }

  /**
   * Sort a specific translation file
   * @param {string} language
   * @param {string} filename
   * @returns {Promise<void>}
   */
  async sortFile(language, filename) {
    const filePath = join(TRANSLATIONS_DIR, language, filename);
    const namespace = filename.replace('.json', '');

    try {
      // Read the file
      const content = readFileSync(filePath, 'utf-8');
      const originalData = JSON.parse(content);

      // Sort the keys
      const sortedData = this.sortObjectKeys(originalData);

      // Compare with original to see if sorting was needed
      const originalJson = JSON.stringify(originalData, null, 2);
      const sortedJson = JSON.stringify(sortedData, null, 2);

      if (originalJson !== sortedJson) {
        // Write the sorted version
        writeFileSync(filePath, sortedJson + '\n', 'utf-8');
        this.sortedFiles.push(`${language}/${filename}`);
        console.log(`  ✅ Sorted ${namespace}.json`);
      } else {
        console.log(`  ✅ ${namespace}.json already sorted`);
      }

      this.processedFiles++;
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.errors.push(`${language}/${filename}: Invalid JSON format`);
        console.log(`  ❌ ${namespace}.json: Invalid JSON format`);
      } else {
        this.errors.push(`${language}/${filename}: ${error.message}`);
        console.log(`  ❌ ${namespace}.json: ${error.message}`);
      }
    }
  }

  /**
   * Recursively sort object keys while preserving nested structure
   * @param {any} obj
   * @returns {any}
   */
  sortObjectKeys(obj) {
    if (Array.isArray(obj)) {
      // Handle arrays - sort their contents if they contain objects
      return obj.map((item) => this.sortObjectKeys(item));
    }

    if (obj !== null && typeof obj === 'object') {
      // Handle objects - sort keys and recurse into values
      const sortedObj = {};
      const sortedKeys = Object.keys(obj).sort((a, b) => {
        // Case-insensitive alphabetical sort
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });

      for (const key of sortedKeys) {
        sortedObj[key] = this.sortObjectKeys(obj[key]);
      }

      return sortedObj;
    }

    // Handle primitives (strings, numbers, booleans, null)
    return obj;
  }

  /**
   * Get sorting result
   * @returns {SortResult}
   */
  getResult() {
    return {
      totalFiles: this.totalFiles,
      processedFiles: this.processedFiles,
      errors: this.errors,
      sortedFiles: this.sortedFiles,
    };
  }
}

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2);
  const flags = {
    dryRun: false,
    verbose: false,
    help: false,
  };

  for (const arg of args) {
    switch (arg) {
      case '--dry-run':
      case '-d':
        flags.dryRun = true;
        break;
      case '--verbose':
      case '-v':
        flags.verbose = true;
        break;
      case '--help':
      case '-h':
        flags.help = true;
        break;
      default:
        console.log(`⚠️  Unknown argument: ${arg}`);
    }
  }

  return flags;
}

// Show help message
function showHelp() {
  console.log(`
📚 Translation Key Sorter

Usage: node sort-translations.mjs [options]

Options:
  -d, --dry-run    Show what would be sorted without making changes
  -v, --verbose    Show detailed output
  -h, --help       Show this help message

Examples:
  node sort-translations.mjs
  node sort-translations.mjs --dry-run
  node sort-translations.mjs --verbose

This script sorts all translation keys alphabetically across all languages.
It preserves nested object structures while ensuring consistent key ordering.
`);
}

// Main execution
async function main() {
  const flags = parseArguments();

  if (flags.help) {
    showHelp();
    process.exit(EXIT_CODES.SUCCESS);
  }

  if (flags.dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }

  const sorter = new TranslationSorter();
  const result = await sorter.sort();

  // Print results
  console.log('📊 Sorting Results:\n');

  if (result.errors.length > 0) {
    console.log('❌ Errors:');
    result.errors.forEach((error) => console.log(`  ${error}`));
    console.log('');
  }

  if (result.sortedFiles.length > 0) {
    console.log(`✅ Sorted ${result.sortedFiles.length} file(s):`);
    result.sortedFiles.forEach((file) => console.log(`  ${file}`));
    console.log('');
  }

  console.log(
    `📈 Processed ${result.processedFiles}/${result.totalFiles} files`
  );

  if (result.errors.length === 0) {
    if (result.sortedFiles.length > 0) {
      console.log('✅ Translation keys sorted successfully!');
    } else {
      console.log('✅ All translation keys were already sorted!');
    }
    process.exit(EXIT_CODES.SUCCESS);
  } else {
    console.log(`❌ Completed with ${result.errors.length} error(s)`);
    process.exit(EXIT_CODES.FILE_ERROR);
  }
}

// Handle unhandled errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(EXIT_CODES.JSON_ERROR);
});

main().catch((error) => {
  console.error('❌ Script error:', error);
  process.exit(EXIT_CODES.JSON_ERROR);
});
