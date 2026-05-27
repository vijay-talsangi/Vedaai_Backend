type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const LOG_COLORS: Record<LogLevel, string> = {
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  debug: '\x1b[35m',
};

const RESET = '\x1b[0m';

function formatTimestamp(): string {
  return new Date().toISOString();
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const color = LOG_COLORS[level];
  const prefix = `${color}[${formatTimestamp()}] [${level.toUpperCase()}]${RESET}`;
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';

  const output = `${prefix} ${message}${metaStr}`;

  switch (level) {
    case 'error':
      console.error(output);
      break;
    case 'warn':
      console.warn(output);
      break;
    case 'debug':
      console.debug(output);
      break;
    default:
      console.log(output);
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>): void => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>): void => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>): void => log('error', message, meta),
  debug: (message: string, meta?: Record<string, unknown>): void => log('debug', message, meta),
};
