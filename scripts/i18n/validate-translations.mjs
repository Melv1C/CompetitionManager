#!/usr/bin/env node

/**
 * Script to validate i18n translations across all languages
 * Verifies that all namespaces exist and contain the same keys across EN, FR, NL
 * Can also generate AI prompts for missing translations with --generate-prompts
 */

import { existsSync, readdirSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LANGUAGES = ['en', 'fr', 'nl'];
const LANGUAGE_NAMES = {
  en: 'English',
  fr: 'French',
  nl: 'Dutch',
};
const TRANSLATIONS_DIR = resolve(__dirname, '../../frontend/src/translations');
const EXIT_CODES = {
  SUCCESS: 0,
  MISSING_FILES: 1,
  MISSING_KEYS: 2,
  INVALID_JSON: 3,
  STRUCTURAL_MISMATCH: 4,
};

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid
 * @property {string[]} errors
 * @property {string[]} warnings
 * @property {Object<string, Object<string, string[]>>} missingTranslations - Structure: {language: {namespace: [keys]}}
 */

/**
 * @typedef {Object} CLIOptions
 * @property {boolean} generatePrompts
 */

class TranslationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.missingTranslations = {}; // Track missing translations by language and namespace
  }

  /**
   * Main validation method
   * @param {CLIOptions} options
   * @returns {Promise<ValidationResult>}
   */
  async validate(options = {}) {
    if (!options.generatePrompts) {
      console.log('🔍 Validating i18n translations...\n');
    }

    // Check if translations directory exists
    if (!existsSync(TRANSLATIONS_DIR)) {
      this.errors.push(`Translations directory not found: ${TRANSLATIONS_DIR}`);
      return this.getResult();
    }

    // Get reference namespaces from English (master language)
    const referenceNamespaces = this.getNamespaces('en');
    if (referenceNamespaces.length === 0) {
      this.errors.push('No translation namespaces found in English directory');
      return this.getResult();
    }

    if (!options.generatePrompts) {
      console.log(
        `📋 Found ${
          referenceNamespaces.length
        } namespaces: ${referenceNamespaces.join(', ')}\n`
      );
    }

    // Validate each language
    for (const lang of LANGUAGES) {
      if (!options.generatePrompts) {
        console.log(`🌍 Validating ${lang.toUpperCase()}...`);
      }
      await this.validateLanguage(lang, referenceNamespaces, options);
      if (!options.generatePrompts) {
        console.log('');
      }
    }

    if (options.generatePrompts) {
      this.generateAIPrompts();
    }

    return this.getResult();
  }

  /**
   * Get all namespace files for a language
   * @param {string} language
   * @returns {string[]}
   */
  getNamespaces(language) {
    const langDir = join(TRANSLATIONS_DIR, language);

    if (!existsSync(langDir)) {
      return [];
    }

    try {
      return readdirSync(langDir)
        .filter((file) => file.endsWith('.json'))
        .map((file) => file.replace('.json', ''))
        .sort();
    } catch (error) {
      this.errors.push(
        `Failed to read ${language} directory: ${error.message}`
      );
      return [];
    }
  }

  /**
   * Validate a specific language against reference namespaces
   * @param {string} language
   * @param {string[]} referenceNamespaces
   * @param {CLIOptions} options
   * @returns {Promise<void>}
   */
  async validateLanguage(language, referenceNamespaces, options = {}) {
    const langDir = join(TRANSLATIONS_DIR, language);

    // Check if language directory exists
    if (!existsSync(langDir)) {
      this.errors.push(`❌ Language directory missing: ${language}`);
      return;
    }

    const currentNamespaces = this.getNamespaces(language);

    // Check for missing namespaces
    const missingNamespaces = referenceNamespaces.filter(
      (ns) => !currentNamespaces.includes(ns)
    );
    if (missingNamespaces.length > 0) {
      this.errors.push(
        `❌ ${language}: Missing namespace files: ${missingNamespaces.join(
          ', '
        )}`
      );

      // Track missing namespaces for AI prompt generation
      if (!this.missingTranslations[language]) {
        this.missingTranslations[language] = {};
      }
      for (const namespace of missingNamespaces) {
        this.missingTranslations[language][namespace] =
          'FULL_NAMESPACE_MISSING';
      }
    }

    // Check for extra namespaces
    const extraNamespaces = currentNamespaces.filter(
      (ns) => !referenceNamespaces.includes(ns)
    );
    if (extraNamespaces.length > 0) {
      this.warnings.push(
        `⚠️  ${language}: Extra namespace files: ${extraNamespaces.join(', ')}`
      );
    }

    // Validate each namespace
    for (const namespace of referenceNamespaces) {
      if (currentNamespaces.includes(namespace)) {
        await this.validateNamespace(language, namespace, options);
      }
    }

    if (
      !options.generatePrompts &&
      missingNamespaces.length === 0 &&
      extraNamespaces.length === 0
    ) {
      console.log(`  ✅ Namespace structure complete`);
    }
  }

  /**
   * Validate a specific namespace file
   * @param {string} language
   * @param {string} namespace
   * @param {CLIOptions} options
   * @returns {Promise<void>}
   */
  async validateNamespace(language, namespace, options = {}) {
    const filePath = join(TRANSLATIONS_DIR, language, `${namespace}.json`);
    const referenceFilePath = join(TRANSLATIONS_DIR, 'en', `${namespace}.json`);

    try {
      // Load reference keys (English)
      const referenceContent = readFileSync(referenceFilePath, 'utf-8');
      const referenceData = JSON.parse(referenceContent);
      const referenceKeys = this.extractKeys(referenceData);

      // Load current language keys
      const currentContent = readFileSync(filePath, 'utf-8');
      const currentData = JSON.parse(currentContent);
      const currentKeys = this.extractKeys(currentData);

      // Check for missing keys
      const missingKeys = referenceKeys.filter(
        (key) => !currentKeys.includes(key)
      );
      if (missingKeys.length > 0) {
        this.errors.push(
          `❌ ${language}/${namespace}: Missing keys: ${missingKeys.join(', ')}`
        );

        // Track missing keys for AI prompt generation
        if (!this.missingTranslations[language]) {
          this.missingTranslations[language] = {};
        }
        this.missingTranslations[language][namespace] = missingKeys;
      }

      // Check for extra keys
      const extraKeys = currentKeys.filter(
        (key) => !referenceKeys.includes(key)
      );
      if (extraKeys.length > 0) {
        this.warnings.push(
          `⚠️  ${language}/${namespace}: Extra keys: ${extraKeys.join(', ')}`
        );
      }

      // Check for empty values
      const emptyKeys = this.findEmptyKeys(currentData);
      if (emptyKeys.length > 0) {
        this.warnings.push(
          `⚠️  ${language}/${namespace}: Empty values: ${emptyKeys.join(', ')}`
        );
      }

      if (missingKeys.length === 0 && extraKeys.length === 0) {
        if (!options.generatePrompts) {
          console.log(
            `  ✅ ${namespace}.json complete (${currentKeys.length} keys)`
          );
        }
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.errors.push(`❌ ${language}/${namespace}: Invalid JSON format`);
      } else {
        this.errors.push(`❌ ${language}/${namespace}: ${error.message}`);
      }
    }
  }

  /**
   * Extract all keys from a translation object (supports nested objects)
   * @param {any} obj
   * @param {string} prefix
   * @returns {string[]}
   */
  extractKeys(obj, prefix = '') {
    const keys = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        // Nested object - recurse
        keys.push(...this.extractKeys(value, fullKey));
      } else {
        // Leaf value
        keys.push(fullKey);
      }
    }

    return keys.sort();
  }

  /**
   * Find keys with empty string values
   * @param {any} obj
   * @param {string} prefix
   * @returns {string[]}
   */
  findEmptyKeys(obj, prefix = '') {
    const emptyKeys = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        emptyKeys.push(...this.findEmptyKeys(value, fullKey));
      } else if (typeof value === 'string' && value.trim() === '') {
        emptyKeys.push(fullKey);
      }
    }

    return emptyKeys;
  }

  /**
   * Generate AI prompts for missing translations
   * @returns {void}
   */
  generateAIPrompts() {
    const nonEnglishLanguages = LANGUAGES.filter((lang) => lang !== 'en');

    for (const language of nonEnglishLanguages) {
      if (!this.missingTranslations[language]) continue;

      const languageName = LANGUAGE_NAMES[language];
      const upperLang = language.toUpperCase();

      console.log(`---\n`);
      console.log(`**${upperLang}:**\n`);
      console.log(
        `You are an expert in internationalization and I need your help to translate the missing keys for my competition management application. This is a sports application used for managing athletic competitions, registrations, and athlete data.\n`
      );
      console.log(
        `Please translate the following JSON structure to ${languageName}. Please maintain the same JSON structure and only replace the English text values with appropriate ${languageName} translations.\n`
      );
      console.log(`Important notes:`);
      console.log(
        `- For interpolation variables like {{count}}, keep them exactly as they are`
      );
      console.log(
        `- Maintain proper grammar and natural flow in ${languageName}`
      );
      console.log(
        `- Consider the sports/athletics context when translating technical terms\n`
      );

      const namespaces = Object.keys(this.missingTranslations[language]).sort();

      for (const namespace of namespaces) {
        const missingData = this.missingTranslations[language][namespace];

        console.log(`**${namespace}.json**`);
        console.log('```json');

        if (missingData === 'FULL_NAMESPACE_MISSING') {
          // Generate prompt for completely missing namespace
          const referenceFilePath = join(
            TRANSLATIONS_DIR,
            'en',
            `${namespace}.json`
          );
          try {
            const referenceContent = readFileSync(referenceFilePath, 'utf-8');
            const referenceData = JSON.parse(referenceContent);

            console.log(JSON.stringify(referenceData, null, 2));
          } catch (error) {
            console.log(`// Error reading reference file: ${error.message}`);
          }
        } else {
          // Generate prompt for missing keys in existing namespace
          const currentFilePath = join(
            TRANSLATIONS_DIR,
            language,
            `${namespace}.json`
          );
          const referenceFilePath = join(
            TRANSLATIONS_DIR,
            'en',
            `${namespace}.json`
          );

          try {
            const currentContent = readFileSync(currentFilePath, 'utf-8');
            const currentData = JSON.parse(currentContent);
            const referenceContent = readFileSync(referenceFilePath, 'utf-8');
            const referenceData = JSON.parse(referenceContent);

            // Create merged object showing current translations and indicating missing ones
            const mergedData = this.createMergedPromptData(
              currentData,
              referenceData,
              missingData
            );
            console.log(JSON.stringify(mergedData, null, 2));
          } catch (error) {
            console.log(`// Error reading files: ${error.message}`);
          }
        }

        console.log('```\n');
      }

      console.log(
        `Please respond with the same JSON structure, replacing only the English values with ${languageName} translations.\n`
      );
    }
  }

  /**
   * Create merged data showing existing translations and missing keys for AI prompt
   * @param {any} currentData
   * @param {any} referenceData
   * @param {string[]} missingKeys
   * @returns {any}
   */
  createMergedPromptData(currentData, referenceData, missingKeys) {
    // Start with existing translations
    const mergedData = JSON.parse(JSON.stringify(currentData));

    // Add missing keys from reference with English values
    for (const missingKey of missingKeys) {
      const keyPath = missingKey.split('.');
      const englishValue = this.getNestedValue(referenceData, keyPath);
      this.setNestedValue(mergedData, keyPath, englishValue);
    }

    return mergedData;
  }

  /**
   * Get nested value from object using key path
   * @param {any} obj
   * @param {string[]} path
   * @returns {any}
   */
  getNestedValue(obj, path) {
    return path.reduce((current, key) => current && current[key], obj);
  }

  /**
   * Set nested value in object using key path
   * @param {any} obj
   * @param {string[]} path
   * @param {any} value
   */
  setNestedValue(obj, path, value) {
    const lastKey = path.pop();
    const target = path.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  /**
   * Get validation result
   * @returns {ValidationResult}
   */
  getResult() {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      missingTranslations: this.missingTranslations,
    };
  }
}

/**
 * Parse command line arguments
 * @returns {CLIOptions}
 */
function parseArguments() {
  const args = process.argv.slice(2);
  return {
    generatePrompts: args.includes('--generate-prompts'),
  };
}

// Run validation
async function main() {
  const options = parseArguments();
  const validator = new TranslationValidator();
  const result = await validator.validate(options);

  // If generating prompts, exit early
  if (options.generatePrompts) {
    process.exit(EXIT_CODES.SUCCESS);
  }

  // Print results
  console.log('📊 Validation Results:\n');

  if (result.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    result.warnings.forEach((warning) => console.log(`  ${warning}`));
    console.log('');
  }

  if (result.errors.length > 0) {
    console.log('❌ Errors:');
    result.errors.forEach((error) => console.log(`  ${error}`));
    console.log('');
  }

  if (result.isValid) {
    console.log('✅ All translations are valid!');
    process.exit(EXIT_CODES.SUCCESS);
  } else {
    console.log(`❌ Found ${result.errors.length} error(s)`);
    process.exit(
      result.errors.some((e) => e.includes('Missing namespace'))
        ? EXIT_CODES.MISSING_FILES
        : EXIT_CODES.MISSING_KEYS
    );
  }
}

// Handle unhandled errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(EXIT_CODES.STRUCTURAL_MISMATCH);
});

main().catch((error) => {
  console.error('❌ Script error:', error);
  process.exit(EXIT_CODES.STRUCTURAL_MISMATCH);
});
