import { NextRequest, NextResponse } from 'next/server'
import { createUser, generateToken, createUserSession, logAnalytics } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { phone, firstName, lastName, password } = await request.json()

    // Validações básicas
    if (!phone || !firstName || !lastName || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Validação do telefone (formato básico)
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Formato de telefone inválido' },
        { status: 400 }
      )
    }

    // Validação da senha (mínimo 6 caracteres)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    const user = await createUser(phone, firstName, lastName, password)
    const token = generateToken(user)
    
    // Criar sessão
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    await createUserSession(user.id, token, 'web', clientIP, userAgent)
    
    // Log de analytics
    await logAnalytics(user.id, 'user_registration_completed', 'auth', { phone, firstName, lastName }, clientIP, userAgent)

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
    console.error('Register error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
