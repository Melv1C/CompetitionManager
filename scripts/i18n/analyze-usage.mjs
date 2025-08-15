#!/usr/bin/env node

/**
 * Script to analyze i18n translation key usage across the codebase
 * Finds used, unused, and missing translation keys by scanning source files
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { dirname, extname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LANGUAGES = ['en', 'fr', 'nl'];
const TRANSLATIONS_DIR = resolve(__dirname, '../../frontend/src/translations');
const SOURCE_DIR = resolve(__dirname, '../../frontend/src');
const EXIT_CODES = {
  SUCCESS: 0,
  MISSING_KEYS: 1,
  UNUSED_KEYS: 2,
  ERROR: 3,
};

/**
 * @typedef {Object} UsageAnalysis
 * @property {Set<string>} usedKeys - All translation keys found in source files
 * @property {Set<string>} definedKeys - All translation keys defined in translation files
 * @property {Set<string>} missingKeys - Keys used in code but not defined in translations
 * @property {Set<string>} unusedKeys - Keys defined in translations but not used in code
 * @property {Object<string, Array<{file: string, line: number, context: string}>>} usage - Where each key is used
 * @property {Object<string, {namespace: string, file: string, keyPath: string}>} definitions - Where each key is defined
 * @property {string[]} errors - Any errors encountered during analysis
 */

class TranslationUsageAnalyzer {
  constructor() {
    this.usedKeys = new Set();
    this.definedKeys = new Set();
    this.usage = {};
    this.definitions = {}; // Track where keys are defined
    this.errors = [];
    this.sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx']);
  }

  /**
   * Main analysis method
   * @param {Object} options
   * @param {boolean} [options.verbose] - Show detailed output
   * @param {boolean} [options.quiet] - Show minimal output
   * @returns {Promise<UsageAnalysis>}
   */
  async analyze(options = {}) {
    if (!options.quiet) {
      console.log('🔍 Analyzing i18n translation key usage...\n');
    }

    // Check if required directories exist
    if (!existsSync(TRANSLATIONS_DIR)) {
      this.errors.push(`Translations directory not found: ${TRANSLATIONS_DIR}`);
      return this.getResult();
    }

    if (!existsSync(SOURCE_DIR)) {
      this.errors.push(`Source directory not found: ${SOURCE_DIR}`);
      return this.getResult();
    }

    // Step 1: Extract all defined translation keys
    if (!options.quiet) console.log('📚 Loading translation definitions...');
    await this.extractDefinedKeys();

    // Step 2: Scan source files for usage
    if (!options.quiet) console.log('🔎 Scanning source files for usage...');
    await this.scanSourceFiles(SOURCE_DIR);

    if (!options.quiet) console.log('📊 Analyzing results...\n');
    return this.getResult();
  }

  /**
   * Extract all translation keys from translation files
   * @returns {Promise<void>}
   */
  async extractDefinedKeys() {
    // Use English as the reference language (master)
    const enDir = join(TRANSLATIONS_DIR, 'en');

    if (!existsSync(enDir)) {
      this.errors.push('English translation directory not found');
      return;
    }

    try {
      const files = readdirSync(enDir).filter((file) => file.endsWith('.json'));

      for (const file of files) {
        const namespace = file.replace('.json', '');
        const filePath = join(enDir, file);

        try {
          const content = readFileSync(filePath, 'utf-8');
          const translations = JSON.parse(content);

          // Extract keys recursively
          this.extractKeysFromObject(translations, namespace, '', file);
        } catch (error) {
          this.errors.push(`Failed to parse ${namespace}: ${error.message}`);
        }
      }
    } catch (error) {
      this.errors.push(
        `Failed to read translations directory: ${error.message}`
      );
    }
  }

  /**
   * Extract keys from a translation object recursively
   * @param {any} obj
   * @param {string} namespace
   * @param {string} prefix
   * @param {string} fileName
   */
  extractKeysFromObject(obj, namespace, prefix = '', fileName = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        // Nested object - recurse
        this.extractKeysFromObject(value, namespace, fullKey, fileName);
      } else {
        // Leaf value - add the key
        const keyWithNamespace = `${namespace}:${fullKey}`;
        this.definedKeys.add(keyWithNamespace);
        this.definedKeys.add(fullKey); // Also add without namespace for flexible matching

        // Track where this key is defined
        this.definitions[keyWithNamespace] = {
          namespace,
          file: fileName,
          keyPath: fullKey,
        };

        // Also track the key without namespace if it doesn't conflict
        if (!this.definitions[fullKey]) {
          this.definitions[fullKey] = {
            namespace,
            file: fileName,
            keyPath: fullKey,
          };
        }
      }
    }
  }

  /**
   * Scan source files for translation key usage
   * @param {string} dir
   * @returns {Promise<void>}
   */
  async scanSourceFiles(dir) {
    try {
      const items = readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        const itemPath = join(dir, item.name);

        if (item.isDirectory()) {
          // Skip certain directories
          if (
            item.name === 'node_modules' ||
            item.name === '.git' ||
            item.name === 'dist' ||
            item.name === 'build'
          ) {
            continue;
          }
          await this.scanSourceFiles(itemPath);
        } else if (
          item.isFile() &&
          this.sourceExtensions.has(extname(item.name))
        ) {
          await this.scanFile(itemPath);
        }
      }
    } catch (error) {
      this.errors.push(`Failed to scan directory ${dir}: ${error.message}`);
    }
  }

  /**
   * Scan a single file for translation usage
   * @param {string} filePath
   * @returns {Promise<void>}
   */
  async scanFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf-8');

      // Skip files that clearly don't contain translations
      if (!content.includes('useTranslation') && !content.includes('t(')) {
        return;
      }

      // Skip test files, config files, and other non-source files
      if (
        filePath.includes('.test.') ||
        filePath.includes('.spec.') ||
        filePath.includes('.config.') ||
        filePath.includes('vite.config') ||
        filePath.includes('tailwind.config') ||
        filePath.includes('eslint.config') ||
        filePath.endsWith('.d.ts')
      ) {
        return;
      }

      const lines = content.split('\n');

      // Extract namespace from useTranslation hook
      const namespaces = this.extractNamespaces(content);
      const defaultNamespace = namespaces.length > 0 ? namespaces[0] : null;

      // Find all t() function calls
      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        this.findTranslationCalls(
          line,
          lineNumber,
          filePath,
          defaultNamespace,
          namespaces
        );
      });
    } catch (error) {
      this.errors.push(`Failed to read file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Extract namespaces from useTranslation calls
   * @param {string} content
   * @returns {string[]}
   */
  extractNamespaces(content) {
    const namespaces = [];

    // Match useTranslation('namespace') or useTranslation(['ns1', 'ns2'])
    const patterns = [
      /useTranslation\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      /useTranslation\s*\(\s*\[([^\]]+)\]\s*\)/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1].includes(',')) {
          // Array format: ['ns1', 'ns2']
          const arrayContent = match[1];
          const nsMatches = arrayContent.match(/['"`]([^'"`]+)['"`]/g);
          if (nsMatches) {
            nsMatches.forEach((nsMatch) => {
              const ns = nsMatch.replace(/['"`]/g, '');
              if (!namespaces.includes(ns)) {
                namespaces.push(ns);
              }
            });
          }
        } else {
          // String format: 'namespace'
          if (!namespaces.includes(match[1])) {
            namespaces.push(match[1]);
          }
        }
      }
    }

    return namespaces;
  }

  /**
   * Find all t() function calls in a line
   * @param {string} line
   * @param {number} lineNumber
   * @param {string} filePath
   * @param {string|null} defaultNamespace
   * @param {string[]} availableNamespaces
   */
  findTranslationCalls(
    line,
    lineNumber,
    filePath,
    defaultNamespace,
    availableNamespaces
  ) {
    // Skip lines that are clearly not translation calls
    if (
      line.includes('import(') ||
      line.includes('await apiClient') ||
      line.includes('createElement') ||
      line.includes('.split(') ||
      line.includes('.url()') ||
      line.includes('.enum(') ||
      line.includes('.emit(') ||
      line.includes('.default(') ||
      line.includes('response.get(') ||
      line.includes("split('") ||
      line.includes('= document.') ||
      line.includes('.request(')
    ) {
      return;
    }

    // More precise patterns to match t() calls:
    // t('key')
    // t('key', { ns: 'namespace' })
    // t('key', options)
    const patterns = [
      // t('key', { ns: 'namespace', ... })
      /\bt\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*\{[^}]*ns:\s*['"`]([^'"`]+)['"`][^}]*\}/g,
      // t('key') - must be a standalone function call, not part of other words
      /\bt\s*\(\s*['"`]([^'"`]+)['"`]\s*(?:\s*,\s*[^)]+)?\s*\)/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const key = match[1];
        const explicitNamespace = match[2]; // Only available in first pattern

        // Skip keys that look like file paths, URLs, or other non-translation strings
        if (
          key.includes('/') ||
          key.includes('\\') ||
          (key.includes('.') &&
            (key.includes('http') ||
              key.includes('www') ||
              key.includes('.com') ||
              key.includes('.json') ||
              key.includes('.ts') ||
              key.includes('.js'))) ||
          (key.includes(':') && !key.match(/^[a-zA-Z]+:[a-zA-Z0-9._-]+$/)) ||
          key.match(/^[A-Z][a-zA-Z]*$/) || // PascalCase (likely component names)
          key.includes(' ') ||
          key.length < 2 ||
          key.match(/^\d+$/) || // Pure numbers
          key.includes('${')
        ) {
          // Template strings
          continue;
        }

        // Determine the namespace
        let namespace = explicitNamespace || defaultNamespace;

        // If no namespace determined and we have available namespaces,
        // we'll register it with all possible namespaces for now
        if (!namespace && availableNamespaces.length > 0) {
          // Try to find the key in available namespaces
          for (const ns of availableNamespaces) {
            const keyWithNs = `${ns}:${key}`;
            if (this.definedKeys.has(keyWithNs) || this.definedKeys.has(key)) {
              namespace = ns;
              break;
            }
          }
          // If still no namespace found, use the first available one
          if (!namespace) {
            namespace = availableNamespaces[0];
          }
        }

        // Register the usage
        const fullKey = namespace ? `${namespace}:${key}` : key;
        this.usedKeys.add(fullKey);
        this.usedKeys.add(key); // Also add without namespace

        // Track usage location
        if (!this.usage[fullKey]) {
          this.usage[fullKey] = [];
        }

        this.usage[fullKey].push({
          file: filePath.replace(SOURCE_DIR, ''),
          line: lineNumber,
          context: line.trim(),
        });
      }
    }
  }

  /**
   * Get analysis result
   * @returns {UsageAnalysis}
   */
  getResult() {
    const missingKeys = new Set();
    const unusedKeys = new Set();

    // Find missing keys (used but not defined)
    for (const key of this.usedKeys) {
      if (!this.definedKeys.has(key)) {
        // Check if it exists without namespace
        const keyWithoutNs = key.includes(':') ? key.split(':')[1] : key;
        if (!this.definedKeys.has(keyWithoutNs)) {
          missingKeys.add(key);
        }
      }
    }

    // Find unused keys (defined but not used)
    for (const key of this.definedKeys) {
      if (!this.usedKeys.has(key)) {
        // Check if it's used without namespace
        const keyWithoutNs = key.includes(':') ? key.split(':')[1] : key;
        if (!this.usedKeys.has(keyWithoutNs)) {
          unusedKeys.add(key);
        }
      }
    }

    return {
      usedKeys: this.usedKeys,
      definedKeys: this.definedKeys,
      missingKeys,
      unusedKeys,
      usage: this.usage,
      definitions: this.definitions,
      errors: this.errors,
    };
  }
}

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2);
  const flags = {
    verbose: false,
    quiet: false,
    help: false,
    showUsage: false,
    showMissing: false,
    showUnused: false,
    includeEnums: false,
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
      case '--show-usage':
        flags.showUsage = true;
        break;
      case '--show-missing':
        flags.showMissing = true;
        break;
      case '--show-unused':
        flags.showUnused = true;
        break;
      case '--include-enums':
        flags.includeEnums = true;
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
🔍 i18n Translation Usage Analyzer

Usage: node analyze-usage.mjs [options]

Options:
  -v, --verbose      Show detailed output including usage locations
  -q, --quiet        Show minimal output (errors and summary only)
  --show-usage       Show where each translation key is used
  --show-missing     Show only missing translation keys
  --show-unused      Show only unused translation keys
  --include-enums    Include enum translations in unused key analysis
  -h, --help         Show this help message

Examples:
  node analyze-usage.mjs
  node analyze-usage.mjs --verbose
  node analyze-usage.mjs --show-missing
  node analyze-usage.mjs --show-unused --verbose
  node analyze-usage.mjs --include-enums

This script analyzes translation key usage by:
1. Loading all defined translation keys from JSON files
2. Scanning TypeScript/React source files for t() function calls
3. Identifying missing keys (used but not defined)
4. Identifying unused keys (defined but not used)
5. Providing detailed usage information

Note: Enum translations are excluded from unused analysis by default
since they are often used programmatically or as utility values.

Exit codes:
  0 - Analysis completed successfully
  1 - Missing translation keys found
  2 - Unused translation keys found (when combined with missing: exit 1)
  3 - Analysis error occurred
`);
}

// Main execution
async function main() {
  const flags = parseArguments();

  if (flags.help) {
    showHelp();
    process.exit(EXIT_CODES.SUCCESS);
  }

  if (flags.verbose && flags.quiet) {
    console.log('❌ Cannot use --verbose and --quiet together');
    process.exit(EXIT_CODES.ERROR);
  }

  try {
    const analyzer = new TranslationUsageAnalyzer();
    const result = await analyzer.analyze({
      verbose: flags.verbose,
      quiet: flags.quiet,
    });

    // Calculate filtered unused keys (excluding enums by default)
    const filteredUnusedKeys = flags.includeEnums
      ? result.unusedKeys
      : new Set(
          Array.from(result.unusedKeys).filter((key) => {
            const definition = result.definitions[key];
            return !definition || definition.namespace !== 'enums';
          })
        );

    // Print results
    if (!flags.quiet) {
      console.log('📊 Usage Analysis Results:\n');

      if (result.errors.length > 0) {
        console.log('❌ Errors:');
        result.errors.forEach((error) => console.log(`  ${error}`));
        console.log('');
      }

      // Summary
      console.log(`📈 Summary:`);
      console.log(`  Defined keys: ${result.definedKeys.size}`);
      console.log(`  Used keys: ${result.usedKeys.size}`);
      console.log(`  Missing keys: ${result.missingKeys.size}`);
      console.log(
        `  Unused keys: ${filteredUnusedKeys.size}${
          flags.includeEnums ? '' : ' (excluding enums)'
        }`
      );
      console.log('');
    } // Show missing keys
    if (
      result.missingKeys.size > 0 &&
      (!flags.showUnused || flags.showMissing)
    ) {
      console.log('❌ Missing Translation Keys:');
      Array.from(result.missingKeys)
        .sort()
        .forEach((key) => {
          const namespace = key.includes(':') ? key.split(':')[0] : 'unknown';
          const keyName = key.includes(':') ? key.split(':')[1] : key;
          console.log(
            `  ❌ ${keyName} (should be in: ${namespace}/${namespace}.json)`
          );
          if ((flags.verbose || flags.showUsage) && result.usage[key]) {
            result.usage[key].forEach((usage) => {
              console.log(
                `     → used in: ${usage.file}:${usage.line} - ${usage.context}`
              );
            });
          }
        });
      console.log('');
    }

    // Show unused keys
    if (
      result.unusedKeys.size > 0 &&
      (!flags.showMissing || flags.showUnused)
    ) {
      console.log('⚠️  Unused Translation Keys:');

      // Group unused keys by namespace for better organization
      const unusedByNamespace = {};

      Array.from(result.unusedKeys)
        .sort()
        .forEach((key) => {
          const definition = result.definitions[key];
          if (definition) {
            const namespace = definition.namespace;

            // Skip enums namespace unless explicitly requested
            if (namespace === 'enums' && !flags.includeEnums) {
              return;
            }

            if (!unusedByNamespace[namespace]) {
              unusedByNamespace[namespace] = [];
            }
            unusedByNamespace[namespace].push({
              key,
              definition,
            });
          } else {
            // Fallback for keys without definition info
            if (!unusedByNamespace['unknown']) {
              unusedByNamespace['unknown'] = [];
            }
            unusedByNamespace['unknown'].push({
              key,
              definition: {
                namespace: 'unknown',
                file: 'unknown',
                keyPath: key,
              },
            });
          }
        });

      // Display by namespace
      const namespacesWithKeys = Object.keys(unusedByNamespace).filter(
        (ns) => unusedByNamespace[ns].length > 0
      );

      if (namespacesWithKeys.length === 0) {
        console.log('  ✅ No unused keys found (excluding enums)');
        console.log('      💡 Use --include-enums to show enum translations');
      } else {
        namespacesWithKeys.sort().forEach((namespace) => {
          console.log(`\n  📁 ${namespace}/ namespace:`);
          unusedByNamespace[namespace].forEach(({ key, definition }) => {
            if (flags.verbose) {
              console.log(`    ❌ ${definition.keyPath}`);
              console.log(`       → defined in: ${definition.file}`);
              if (key.includes(':')) {
                console.log(`       → full key: ${key}`);
              }
            } else {
              const displayKey = key.includes(':') ? key.split(':')[1] : key;
              console.log(`    ❌ ${displayKey} (${definition.file})`);
            }
          });
        });

        if (!flags.includeEnums) {
          console.log(
            '\n      💡 Use --include-enums to also show enum translations'
          );
        }
      }
      console.log('');
    }

    // Show usage information if requested
    if (flags.showUsage && !flags.showMissing && !flags.showUnused) {
      console.log('📍 Translation Key Usage:');
      Object.entries(result.usage)
        .sort()
        .forEach(([key, usages]) => {
          console.log(`  ${key}:`);
          usages.forEach((usage) => {
            console.log(`    → ${usage.file}:${usage.line} - ${usage.context}`);
          });
        });
      console.log('');
    }

    // Determine exit code
    if (result.errors.length > 0) {
      if (!flags.quiet) console.log('❌ Analysis completed with errors');
      process.exit(EXIT_CODES.ERROR);
    } else if (result.missingKeys.size > 0) {
      if (!flags.quiet) console.log('❌ Missing translation keys found');
      process.exit(EXIT_CODES.MISSING_KEYS);
    } else if (filteredUnusedKeys.size > 0) {
      if (!flags.quiet) console.log('⚠️  Unused translation keys found');
      process.exit(EXIT_CODES.UNUSED_KEYS);
    } else {
      if (!flags.quiet)
        console.log('✅ All translation keys are properly used!');
      process.exit(EXIT_CODES.SUCCESS);
    }
  } catch (error) {
    console.error('❌ Analysis error:', error);
    process.exit(EXIT_CODES.ERROR);
  }
}

// Handle unhandled errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(EXIT_CODES.ERROR);
});

main();
