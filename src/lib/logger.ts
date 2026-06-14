type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  [key: string]: unknown
}

function formatEntry(entry: LogEntry): string {
  return JSON.stringify(entry)
}

export const logger = {
  debug(message: string, context?: string, data?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatEntry({ timestamp: new Date().toISOString(), level: 'debug', message, context, ...data }))
    }
  },

  info(message: string, context?: string, data?: Record<string, unknown>) {
    console.log(formatEntry({ timestamp: new Date().toISOString(), level: 'info', message, context, ...data }))
  },

  warn(message: string, context?: string, data?: Record<string, unknown>) {
    console.warn(formatEntry({ timestamp: new Date().toISOString(), level: 'warn', message, context, ...data }))
  },

  error(message: string, context?: string, error?: unknown) {
    const errorData: Record<string, unknown> = {}
    if (error instanceof Error) {
      errorData.name = error.name
      errorData.message = error.message
      errorData.stack = error.stack
    } else if (error) {
      errorData.error = error
    }
    console.error(formatEntry({ timestamp: new Date().toISOString(), level: 'error', message, context, ...errorData }))
  },
}