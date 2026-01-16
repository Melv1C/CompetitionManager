import { levelPriority, type LogLevel, type LogStep } from '@repo/utils';
import type { Context, Next } from 'hono';
import { Logger } from 'winston';

export type StepLogger = {
  debug: (message: LogStep['message'], metadata?: LogStep['metadata']) => void;
  info: (message: LogStep['message'], metadata?: LogStep['metadata']) => void;
  warn: (message: LogStep['message'], metadata?: LogStep['metadata']) => void;
  error: (message: LogStep['message'], metadata?: LogStep['metadata']) => void;
};

declare module 'hono' {
  interface ContextVariableMap {
    logStep: StepLogger;
  }
}

export const requestLogger = (logger: Logger) => async (c: Context, next: Next) => {
  const start = Date.now();

  const steps: LogStep[] = [];

  const requestLogger = {
    debug: (message: LogStep['message'], metadata: LogStep['metadata'] = {}) => {
      steps.push({
        level: 'debug',
        message,
        metadata,
        timestamp: Date.now(),
      });
    },
    info: (message: LogStep['message'], metadata: LogStep['metadata'] = {}) => {
      steps.push({
        level: 'info',
        message,
        metadata,
        timestamp: Date.now(),
      });
    },
    warn: (message: LogStep['message'], metadata: LogStep['metadata'] = {}) => {
      steps.push({
        level: 'warn',
        message,
        metadata,
        timestamp: Date.now(),
      });
    },
    error: (message: LogStep['message'], metadata: LogStep['metadata'] = {}) => {
      steps.push({
        level: 'error',
        message,
        metadata,
        timestamp: Date.now(),
      });
    },
  };

  c.set('logStep', requestLogger);

  try {
    await next();
  } finally {
    const durationMs = Date.now() - start;

    // Compute the overall log level based on the steps
    const overallLevel = steps.reduce<LogLevel>((highest, step) => {
      return levelPriority[step.level] > levelPriority[highest] ? step.level : highest;
    }, 'debug');

    logger.log({
      level: overallLevel,
      message: `Request ${c.req.method} ${c.req.path} completed`,
      type: 'REQUEST',
      method: c.req.method,
      path: c.req.path,
      statusCode: c.res.status,
      durationMs,
      userId: c.get('user')?.id,
      steps,
    });
  }
};
