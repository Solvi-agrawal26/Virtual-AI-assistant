type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private format(level: LogLevel, message: string, meta?: unknown) {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  info(message: string, meta?: unknown) {
    console.log('\x1b[36m%s\x1b[0m', this.format('info', message, meta));
  }

  warn(message: string, meta?: unknown) {
    console.warn('\x1b[33m%s\x1b[0m', this.format('warn', message, meta));
  }

  error(message: string, meta?: unknown) {
    console.error('\x1b[31m%s\x1b[0m', this.format('error', message, meta));
  }

  debug(message: string, meta?: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('\x1b[90m%s\x1b[0m', this.format('debug', message, meta));
    }
  }
}

export const logger = new Logger();
