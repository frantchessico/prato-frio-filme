import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, findUserById } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autenticação necessário' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const tokenData = verifyToken(token)
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Buscar usuário no banco
    const user = await findUserById(tokenData.id)
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se a doação ainda é válida (3 dias)
    const now = new Date()
    const isDonationValid = user.hasDonated && 
      user.donationExpiresAt && 
      new Date(user.donationExpiresAt) > now

    return NextResponse.json({
      hasDonated: isDonationValid,
      donationAmount: user.donationAmount || 0,
      donationDate: user.donationDate || null,
      donationExpiresAt: user.donationExpiresAt || null,
      isExpired: user.hasDonated && (!user.donationExpiresAt || new Date(user.donationExpiresAt) <= now)
    })

  } catch (error: any) {
    console.error('Donation status error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
