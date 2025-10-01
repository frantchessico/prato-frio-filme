// Sistema de segurança para dados sensíveis

// Sanitizar dados para logs
export function sanitizeForLog(data: any): any {
  if (typeof data === 'string') {
    // Mascarar números de telefone
    if (data.match(/^\d{9,15}$/)) {
      return data.replace(/(\d{3})\d{3}(\d{3})/, '$1***$2')
    }
    // Mascarar emails
    if (data.includes('@')) {
      const [local, domain] = data.split('@')
      return `${local.substring(0, 2)}***@${domain}`
    }
    return data
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      if (key.toLowerCase().includes('phone') || 
          key.toLowerCase().includes('email') ||
          key.toLowerCase().includes('password') ||
          key.toLowerCase().includes('token')) {
        sanitized[key] = '***MASKED***'
      } else {
        sanitized[key] = sanitizeForLog(value)
      }
    }
    return sanitized
  }
  
  return data
}

// Validar dados de entrada
export function validateInput(data: any, schema: Record<string, any>): boolean {
  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key]
    
    if (rules.required && (value === undefined || value === null || value === '')) {
      return false
    }
    
    if (value !== undefined && rules.type && typeof value !== rules.type) {
      return false
    }
    
    if (value !== undefined && rules.min && value < rules.min) {
      return false
    }
    
    if (value !== undefined && rules.max && value > rules.max) {
      return false
    }
    
    if (value !== undefined && rules.pattern && !rules.pattern.test(value)) {
      return false
    }
  }
  
  return true
}

// Esquemas de validação
export const validationSchemas = {
  phone: {
    required: true,
    type: 'string',
    pattern: /^[0-9]{9,15}$/
  },
  password: {
    required: true,
    type: 'string',
    min: 6
  },
  amount: {
    required: true,
    type: 'number',
    min: 99
  }
}

// Rate limiting simples
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, limit: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}

// Limpar dados sensíveis do localStorage
export function clearSensitiveData() {
  if (typeof window !== 'undefined') {
    const sensitiveKeys = ['auth_token', 'user_data', 'payment_data']
    sensitiveKeys.forEach(key => {
      localStorage.removeItem(key)
    })
  }
}
