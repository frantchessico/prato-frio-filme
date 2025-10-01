import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateToken, createUserSession, logAnalytics } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { validateInput, validationSchemas, checkRateLimit } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json()

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(`login:${clientIP}`, 5, 60000)) {
      return NextResponse.json(
        { error: 'Muitas tentativas de login. Tente novamente em 1 minuto.' },
        { status: 429 }
      )
    }

    // Validações de segurança
    if (!validateInput({ phone, password }, {
      phone: validationSchemas.phone,
      password: validationSchemas.password
    })) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    const user = await authenticateUser(phone, password)
    const token = generateToken(user)
    
    // Criar sessão
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    await createUserSession(user.id, token, 'web', clientIP, userAgent)
    
    // Log de analytics
    await logAnalytics(user.id, 'user_login_completed', 'auth', { phone }, clientIP, userAgent)

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        hasDonated: user.hasDonated
      }
    })

  } catch (error: any) {
    logger.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 401 }
    )
  }
}
