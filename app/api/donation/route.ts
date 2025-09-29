import { NextRequest, NextResponse } from 'next/server'
import { initiatePayment } from '@/lib/mpesa'
import { verifyToken, findUserById, logAnalytics } from '@/lib/auth'
import { Donation } from '@/models/Donation'
import dbConnect from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { phoneNumber, amount } = await request.json()

    // Validações básicas
    if (!phoneNumber || !amount) {
      return NextResponse.json(
        { error: 'Telefone e valor são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar valor mínimo
    if (amount < 99) {
      return NextResponse.json(
        { error: 'Valor mínimo de doação é 99 MZN' },
        { status: 400 }
      )
    }

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

    // Iniciar pagamento M-Pesa
    const paymentResult = await initiatePayment({
      phoneNumber,
      amount
    })

    if (paymentResult.success) {
      // Salvar doação no banco
      const donation = new Donation({
        userId: user._id.toString(),
        phone: phoneNumber,
        amount,
        reference: paymentResult.reference,
        transactionId: paymentResult.transactionId,
        status: 'pending',
        mpesaResponse: paymentResult.data
      })

      await donation.save()

      // Log de analytics
      const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'
      
      await logAnalytics(
        user._id.toString(),
        'donation_initiated',
        'donation',
        { amount, reference: paymentResult.reference, phone: phoneNumber },
        clientIP,
        userAgent
      )

      return NextResponse.json({
        success: true,
        reference: paymentResult.reference,
        transactionId: paymentResult.transactionId,
        message: paymentResult.message,
        data: paymentResult.data
      })
    } else {
      // Log de erro
      const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'
      
      await logAnalytics(
        user._id.toString(),
        'donation_failed',
        'donation',
        { amount, error: paymentResult.error, phone: phoneNumber },
        clientIP,
        userAgent
      )

      return NextResponse.json(
        { error: paymentResult.error || 'Erro ao processar pagamento' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Donation error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
