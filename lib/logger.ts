import { sanitizeForLog } from './security'

// Sistema de logging condicional para produção
const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args)
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  }
}

// Para dados sensíveis - sempre sanitizar
export const secureLogger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      const sanitizedArgs = args.map(arg => sanitizeForLog(arg))
      console.log(...sanitizedArgs)
    }
  },
  
  error: (...args: any[]) => {
    if (isDevelopment) {
      const sanitizedArgs = args.map(arg => sanitizeForLog(arg))
      console.error(...sanitizedArgs)
    }
  }
}
