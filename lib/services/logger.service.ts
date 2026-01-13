export class LoggerService {
  private static instance: LoggerService

  private constructor() {}

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService()
    }
    return LoggerService.instance
  }

  info(message: string, data?: any) {
    console.log(`[INFO] ${message}`, data)
  }

  error(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error)
  }

  warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data)
  }

  debug(message: string, context?: any) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, context)
    }
  }
}

// Singleton export
export const logger = LoggerService.getInstance()
