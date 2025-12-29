import 'dotenv/config';

const CRON_JOBS = ['athlete-sync', 'log-cleanup'];

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, COLORS.cyan);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, COLORS.green);
}

function logError(message: string) {
  log(`❌ ${message}`, COLORS.red);
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, COLORS.yellow);
}

function printHeader(jobName: string) {
  console.log();
  log('═══════════════════════════════════════════════════', COLORS.blue);
  log(`  🕐 CRON JOB RUNNER`, COLORS.bright);
  log(`  Job: ${jobName}`, COLORS.cyan);
  log(`  Time: ${new Date().toLocaleString()}`, COLORS.cyan);
  log('═══════════════════════════════════════════════════', COLORS.blue);
  console.log();
}

function printAvailableJobs() {
  console.log();
  logWarning('Available cron jobs:');
  console.log();
  for (const name of CRON_JOBS) {
    log(`  • ${name}`, COLORS.cyan);
  }
  console.log();
  log('Usage: npm run cron <job-name>', COLORS.yellow);
  console.log();
}

async function runCronJob(jobName: string, content: Record<string, string>) {
  const cronSecret = process.env.CRON_SECRET;
  const port = process.env.PORT || 3000;

  if (!cronSecret) {
    logError('CRON_SECRET environment variable is not set');
    process.exit(1);
  }

  if (!CRON_JOBS.includes(jobName)) {
    logError(`Unknown cron job: "${jobName}"`);
    printAvailableJobs();
    process.exit(1);
  }

  printHeader(jobName);

  const url = `http://localhost:${port}/api/cron/${jobName}`;
  logInfo(`Calling: ${url}`);

  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(content),
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    console.log();
    if (response.ok) {
      logSuccess(`Job completed successfully in ${duration}ms`);
      console.log();
      log('Response:', COLORS.bright);
      console.log(JSON.stringify(data, null, 2));
    } else {
      logError(`Job failed with status ${response.status}`);
      console.log();
      log('Error response:', COLORS.red);
      console.log(JSON.stringify(data, null, 2));
      process.exit(1);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log();
    logError(`Request failed after ${duration}ms`);
    console.log();

    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        logError('Could not connect to the server. Is the backend running?');
        log(`  Make sure the server is running on port ${port}`, COLORS.yellow);
      } else {
        logError(`Error: ${error.message}`);
      }
    } else {
      logError(`Unknown error: ${String(error)}`);
    }

    process.exit(1);
  }

  console.log();
  log('═══════════════════════════════════════════════════', COLORS.blue);
  console.log();
}

// Main execution
const jobName = process.argv[2];

if (!jobName) {
  logError('No cron job specified');
  printAvailableJobs();
  process.exit(1);
}

const content: Record<string, string> = {};
//every argument after the second is use for in the post content arg should be key=value
for (let i = 3; i < process.argv.length; i++) {
  const arg = process.argv[i];
  const [key, value] = arg.split('=');
  if (!key || !value) {
    logError(`Invalid argument: ${arg}. Expected format key=value`);
    process.exit(1);
  }
  content[key] = value;
}

runCronJob(jobName, content);
