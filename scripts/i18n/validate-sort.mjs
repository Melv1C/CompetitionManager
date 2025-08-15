#!/usr/bin/env node

/**
 * Script to validate that translation keys are properly sorted alphabetically
 * This script is designed for CI pipelines to ensure consistent key ordering
 */

import { existsSync, readdirSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LANGUAGES = ['en', 'fr', 'nl'];
const TRANSLATIONS_DIR = resolve(__dirname, '../../frontend/src/translations');
const EXIT_CODES = {
  SUCCESS: 0,
  UNSORTED_FILES: 1,
  DIRECTORY_ERROR: 2,
  JSON_ERROR: 3,
};

/**
 * @typedef {Object} SortValidationResult
 * @property {number} totalFiles
 * @property {number} validFiles
 * @property {string[]} unsortedFiles
 * @property {string[]} errors
 */

class TranslationSortValidator {
  constructor() {
    this.errors = [];
    this.unsortedFiles = [];
    this.totalFiles = 0;
    this.validFiles = 0;
  }

  /**
   * Main validation method
   * @returns {Promise<SortValidationResult>}
   */
  async validate() {
    console.log('🔍 Validating translation key sorting...\n');

    // Check if translations directory exists
    if (!existsSync(TRANSLATIONS_DIR)) {
      this.errors.push(`Translations directory not found: ${TRANSLATIONS_DIR}`);
      return this.getResult();
    }

    // Process each language
    for (const lang of LANGUAGES) {
      console.log(`🌍 Checking ${lang.toUpperCase()}...`);
      await this.validateLanguage(lang);
      console.log('');
    }

    return this.getResult();
  }

  /**
   * Validate sorting for all translation files in a specific language
   * @param {string} language
   * @returns {Promise<void>}
   */
  async validateLanguage(language) {
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
        await this.validateFile(language, file);
      }
    } catch (error) {
      this.errors.push(
        `Failed to read ${language} directory: ${error.message}`
      );
      console.log(`  ❌ Error reading directory: ${error.message}`);
    }
  }

  /**
   * Validate sorting for a specific translation file
   * @param {string} language
   * @param {string} filename
   * @returns {Promise<void>}
   */
  async validateFile(language, filename) {
    const filePath = join(TRANSLATIONS_DIR, language, filename);
    const namespace = filename.replace('.json', '');

    try {
      // Read the file
      const content = readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      // Check if the object is properly sorted
      const isSorted = this.isObjectSorted(data);
      const filePath_relative = `${language}/${filename}`;

      if (isSorted) {
        console.log(`  ✅ ${namespace}.json properly sorted`);
        this.validFiles++;
      } else {
        console.log(`  ❌ ${namespace}.json keys are not sorted`);
        this.unsortedFiles.push(filePath_relative);
      }
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
   * Check if an object has sorted keys (recursively)
   * @param {any} obj
   * @param {string} path
   * @returns {boolean}
   */
  isObjectSorted(obj, path = '') {
    if (Array.isArray(obj)) {
      // Check each item in the array
      return obj.every((item, index) =>
        this.isObjectSorted(item, `${path}[${index}]`)
      );
    }

    if (obj !== null && typeof obj === 'object') {
      const keys = Object.keys(obj);

      // Check if current level keys are sorted
      const sortedKeys = [...keys].sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      );

      const currentLevelSorted =
        JSON.stringify(keys) === JSON.stringify(sortedKeys);

      if (!currentLevelSorted) {
        return false;
      }

      // Recursively check nested objects
      return keys.every((key) =>
        this.isObjectSorted(obj[key], path ? `${path}.${key}` : key)
      );
    }

    // Primitives are always "sorted"
    return true;
  }

  /**
   * Get validation result
   * @returns {SortValidationResult}
   */
  getResult() {
    return {
      totalFiles: this.totalFiles,
      validFiles: this.validFiles,
      unsortedFiles: this.unsortedFiles,
      errors: this.errors,
    };
  }
}

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2);
  const flags = {
    verbose: false,
    help: false,
    quiet: false,
  };

  for (const arg of args) {
    switch (arg) {
      case '--verbose':
      case '-v':
        flags.verbose = true;
        break;
      case '--quiet':
      case '-q':
        flags.quiet = true;
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
🔍 Translation Sort Validator

Usage: node validate-sort.mjs [options]

Options:
  -v, --verbose    Show detailed output
  -q, --quiet      Show minimal output (errors only)
  -h, --help       Show this help message

Examples:
  node validate-sort.mjs
  node validate-sort.mjs --verbose
  node validate-sort.mjs --quiet

This script validates that all translation keys are sorted alphabetically.
It's designed for use in CI pipelines to ensure consistent key ordering.

Exit codes:
  0 - All files are properly sorted
  1 - Some files have unsorted keys
  2 - Directory or file access errors
  3 - JSON parsing errors
`);
}

// Main execution
async function main() {
  const flags = parseArguments();

  if (flags.help) {
    showHelp();
    process.exit(EXIT_CODES.SUCCESS);
  }

  const validator = new TranslationSortValidator();
  const result = await validator.validate();

  // Print results based on verbosity
  if (!flags.quiet) {
    console.log('📊 Sort Validation Results:\n');

    if (result.errors.length > 0) {
      console.log('❌ Errors:');
      result.errors.forEach((error) => console.log(`  ${error}`));
      console.log('');
    }

    if (result.unsortedFiles.length > 0) {
      console.log('❌ Unsorted files:');
      result.unsortedFiles.forEach((file) => console.log(`  ${file}`));
      console.log('');
      console.log('💡 Run "npm run i18n:sort" to fix sorting issues\n');
    }

    console.log(
      `📈 Checked ${result.totalFiles} files - ${result.validFiles} properly sorted`
    );
  }

  // Determine exit code and final message
  if (result.errors.length > 0) {
    if (!flags.quiet)
      console.log(`❌ Validation failed with ${result.errors.length} error(s)`);
    process.exit(EXIT_CODES.JSON_ERROR);
  } else if (result.unsortedFiles.length > 0) {
    if (!flags.quiet) {
      console.log(`❌ Found ${result.unsortedFiles.length} unsorted file(s)`);
    } else {
      console.log('❌ Translation keys are not properly sorted');
      console.log('Unsorted files:');
      result.unsortedFiles.forEach((file) => console.log(`  ${file}`));
      console.log('\n💡 Run "npm run i18n:sort" to fix sorting issues');
    }
    process.exit(EXIT_CODES.UNSORTED_FILES);
  } else {
    if (!flags.quiet)
      console.log('✅ All translation keys are properly sorted!');
    process.exit(EXIT_CODES.SUCCESS);
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
