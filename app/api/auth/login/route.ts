import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateToken, createUserSession, logAnalytics } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json()

    // Validações básicas
    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Telefone e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const user = await authenticateUser(phone, password)
    const token = generateToken(user)
    
    // Criar sessão
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
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
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 401 }
    )
  }
}
