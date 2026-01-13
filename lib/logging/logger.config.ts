type LogLevel = "info" | "warn" | "error" | "debug" | "trace"

// Verifică dacă rulăm pe server sau client
const isServer = typeof window === "undefined"

// Winston logger va fi încărcat dinamic doar pe server
let winstonLogger: any = null
let winstonInitialized = false

// Funcție pentru inițializare Winston lazy (doar când e nevoie)
async function getWinstonLogger() {
  if (!isServer) return null

  if (!winstonInitialized) {
    try {
      const winston = await import("winston")

      winstonLogger = winston.default.createLogger({
        level: process.env.LOG_LEVEL || "info",
        format: winston.default.format.combine(
          winston.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          winston.default.format.errors({ stack: true }),
          winston.default.format.splat(),
          winston.default.format.json(),
        ),
        transports: [
          // Console transport
          new winston.default.transports.Console({
            format: winston.default.format.combine(
              winston.default.format.colorize(),
              winston.default.format.printf(({ timestamp, level, message, context, ...meta }) => {
                let log = `${timestamp} [${level}]`
                if (context) log += ` [${context}]`
                log += `: ${message}`
                if (Object.keys(meta).length > 0) {
                  log += ` ${JSON.stringify(meta)}`
                }
                return log
              }),
            ),
          }),
          // File transport pentru logs
          new winston.default.transports.File({
            filename: "logs/app.log",
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
          // File transport pentru errors
          new winston.default.transports.File({
            filename: "logs/errors.log",
            level: "error",
            maxsize: 5242880,
            maxFiles: 5,
          }),
        ],
      })

      winstonInitialized = true
    } catch (error) {
      console.error("[Logger] Failed to initialize Winston:", error)
    }
  }

  return winstonLogger
}

// Logger class exportată
export class Logger {
  private context: string

  constructor(context: string) {
    this.context = context
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19)
    let log = `${timestamp} [${level.toUpperCase()}] [${this.context}]: ${message}`
    if (meta && Object.keys(meta).length > 0) {
      log += ` | ${JSON.stringify(meta)}`
    }
    return log
  }

  async info(message: string, meta?: any) {
    if (isServer) {
      const winston = await getWinstonLogger()
      if (winston) {
        winston.info(message, { context: this.context, ...meta })
        return
      }
    }
    console.log(this.formatMessage("info", message, meta))
  }

  async error(message: string, error?: Error, meta?: any) {
    if (isServer) {
      const winston = await getWinstonLogger()
      if (winston) {
        winston.error(message, {
          context: this.context,
          stack: error?.stack,
          ...meta,
        })
        return
      }
    }
    console.error(this.formatMessage("error", message, meta))
    if (error?.stack) console.error(error.stack)
  }

  async warn(message: string, meta?: any) {
    if (isServer) {
      const winston = await getWinstonLogger()
      if (winston) {
        winston.warn(message, { context: this.context, ...meta })
        return
      }
    }
    console.warn(this.formatMessage("warn", message, meta))
  }

  async debug(message: string, meta?: any) {
    if (isServer) {
      const winston = await getWinstonLogger()
      if (winston) {
        winston.debug(message, { context: this.context, ...meta })
        return
      }
    }
    console.debug(this.formatMessage("debug", message, meta))
  }

  async trace(message: string, meta?: any) {
    if (isServer) {
      const winston = await getWinstonLogger()
      if (winston) {
        winston.silly(message, { context: this.context, ...meta })
        return
      }
    }
    console.debug(this.formatMessage("trace", message, meta))
  }
}

// Export singleton pentru compatibilitate
export const logger = new Logger("App")
