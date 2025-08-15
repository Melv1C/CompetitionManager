#!/usr/bin/env node

/**
 * Main i18n validation script that runs all translation checks
 * Designed for CI pipelines to validate translations comprehensively
 */

import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EXIT_CODES = {
  SUCCESS: 0,
  VALIDATION_FAILED: 1,
  SCRIPT_ERROR: 2,
};

/**
 * @typedef {Object} ValidationStep
 * @property {string} name
 * @property {string} script
 * @property {string[]} args
 * @property {boolean} required
 * @property {string} description
 */

class I18nValidator {
  constructor() {
    this.steps = [
      {
        name: 'Structure Validation',
        script: resolve(__dirname, 'validate-translations.mjs'),
        args: [],
        required: true,
        description:
          'Validates that all namespaces and keys exist across all languages',
      },
      {
        name: 'Sort Validation',
        script: resolve(__dirname, 'validate-sort.mjs'),
        args: ['--quiet'],
        required: true,
        description: 'Validates that all translation keys are properly sorted',
      },
      {
        name: 'Usage Analysis',
        script: resolve(__dirname, 'analyze-usage.mjs'),
        args: ['--quiet'],
        required: false,
        description:
          'Analyzes translation key usage and finds unused/missing keys',
      },
    ];

    this.results = [];
  }
  /**
   * Run all validation steps
   * @param {Object} options
   * @param {boolean} [options.skipUsage]
   * @param {boolean} [options.verbose]
   * @returns {Promise<boolean>}
   */
  async validate(options = {}) {
    console.log('🚀 Running i18n validation suite...\n');

    let allPassed = true;
    const stepsToRun = options.skipUsage
      ? this.steps.filter((step) => step.name !== 'Usage Analysis')
      : this.steps;

    for (const step of stepsToRun) {
      console.log(`📋 ${step.name}...`);
      if (options.verbose) {
        console.log(`   ${step.description}`);
      }

      const result = await this.runStep(step, options.verbose);
      this.results.push(result);

      if (result.success) {
        console.log(`   ✅ Passed\n`);
      } else {
        console.log(`   ❌ Failed\n`);
        if (step.required) {
          allPassed = false;
        }
      }
    }

    return allPassed;
  }

  /**
   * Run a single validation step
   * @param {ValidationStep} step
   * @param {boolean} verbose
   * @returns {Promise<{step: ValidationStep, success: boolean, output: string}>}
   */
  async runStep(step, verbose = false) {
    return new Promise((resolve) => {
      const process = spawn('node', [step.script, ...step.args], {
        stdio: verbose ? 'inherit' : 'pipe',
        cwd: __dirname,
      });

      let output = '';

      if (!verbose) {
        process.stdout?.on('data', (data) => {
          output += data.toString();
        });

        process.stderr?.on('data', (data) => {
          output += data.toString();
        });
      }

      process.on('close', (code) => {
        resolve({
          step,
          success: code === 0,
          output,
        });
      });

      process.on('error', (error) => {
        resolve({
          step,
          success: false,
          output: `Process error: ${error.message}`,
        });
      });
    });
  }

  /**
   * Print detailed results
   * @param {boolean} verbose
   */
  printResults(verbose = false) {
    console.log('📊 Validation Results Summary:\n');

    for (const result of this.results) {
      const status = result.success ? '✅' : '❌';
      const required = result.step.required ? '(required)' : '(optional)';
      console.log(`${status} ${result.step.name} ${required}`);

      if (!result.success && result.output && verbose) {
        console.log('   Output:');
        result.output.split('\n').forEach((line) => {
          if (line.trim()) console.log(`   ${line}`);
        });
        console.log('');
      }
    }

    const passed = this.results.filter((r) => r.success).length;
    const failed = this.results.filter((r) => !r.success).length;
    const requiredFailed = this.results.filter(
      (r) => !r.success && r.step.required
    ).length;

    console.log(`\n📈 Summary: ${passed} passed, ${failed} failed`);
    if (requiredFailed > 0) {
      console.log(`❌ ${requiredFailed} required validation(s) failed`);
    }
  }
}

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2);
  const flags = {
    skipUsage: false,
    verbose: false,
    help: false,
    fix: false,
  };

  for (const arg of args) {
    switch (arg) {
      case '--skip-usage':
        flags.skipUsage = true;
        break;
      case '--verbose':
      case '-v':
        flags.verbose = true;
        break;
      case '--fix':
        flags.fix = true;
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
🔍 i18n Validation Suite

Usage: node validate-all.mjs [options]

Options:
  --skip-usage      Skip usage analysis (faster for CI)
  --fix             Attempt to fix sorting issues automatically
  -v, --verbose     Show detailed output from all validation steps
  -h, --help        Show this help message

Examples:
  node validate-all.mjs
  node validate-all.mjs --skip-usage
  node validate-all.mjs --verbose
  node validate-all.mjs --fix

This script runs all i18n validation checks:
1. Structure validation (required)
2. Sort validation (required)  
3. Usage analysis (optional)

Exit codes:
  0 - All required validations passed
  1 - One or more required validations failed
  2 - Script execution error
`);
}

// Run fix attempt
async function runFix() {
  console.log('🔧 Attempting to fix translation issues...\n');

  return new Promise((resolve) => {
    const sortScript = resolve(__dirname, 'sort-translations.mjs');
    const process = spawn('node', [sortScript], {
      stdio: 'inherit',
      cwd: __dirname,
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Automatic fixes applied successfully');
        resolve(true);
      } else {
        console.log('\n❌ Some issues could not be automatically fixed');
        resolve(false);
      }
    });

    process.on('error', (error) => {
      console.log(`\n❌ Fix script error: ${error.message}`);
      resolve(false);
    });
  });
}

// Main execution
async function main() {
  const flags = parseArguments();

  if (flags.help) {
    showHelp();
    process.exit(EXIT_CODES.SUCCESS);
  }

  try {
    // Run fix if requested
    if (flags.fix) {
      const fixSuccess = await runFix();
      if (!fixSuccess) {
        process.exit(EXIT_CODES.SCRIPT_ERROR);
      }
      console.log(''); // Add spacing
    }

    // Run validation
    const validator = new I18nValidator();
    const success = await validator.validate({
      skipUsage: flags.skipUsage,
      verbose: flags.verbose,
    });

    // Print results
    if (!flags.verbose) {
      validator.printResults(false);
    }

    // Exit with appropriate code
    if (success) {
      console.log('\n✅ All i18n validations passed!');
      process.exit(EXIT_CODES.SUCCESS);
    } else {
      console.log('\n❌ i18n validation failed');
      process.exit(EXIT_CODES.VALIDATION_FAILED);
    }
  } catch (error) {
    console.error('❌ Validation suite error:', error);
    process.exit(EXIT_CODES.SCRIPT_ERROR);
  }
}

// Handle unhandled errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(EXIT_CODES.SCRIPT_ERROR);
});

main();
