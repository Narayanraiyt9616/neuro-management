/**
 * BizNexus Central Logger
 * Formatted, timestamped logging utility
 */
export const logger = {
  info: (msg: string, meta: Record<string, unknown> = {}): void => {
    const ts = new Date().toISOString();
    console.log(`[INFO]  [${ts}] ${msg}`, Object.keys(meta).length ? meta : '');
  },
  warn: (msg: string, meta: Record<string, unknown> = {}): void => {
    const ts = new Date().toISOString();
    console.warn(`[WARN]  [${ts}] ${msg}`, Object.keys(meta).length ? meta : '');
  },
  error: (msg: string, error: unknown = {}): void => {
    const ts = new Date().toISOString();
    const errStack = error instanceof Error ? error.stack : error;
    console.error(`[ERROR] [${ts}] ${msg}`, errStack);
  },
  debug: (msg: string, meta: Record<string, unknown> = {}): void => {
    if (process.env.NODE_ENV !== 'production') {
      const ts = new Date().toISOString();
      console.debug(`[DEBUG] [${ts}] ${msg}`, Object.keys(meta).length ? meta : '');
    }
  }
};

export default logger;

