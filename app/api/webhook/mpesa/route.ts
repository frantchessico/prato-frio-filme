import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Donation } from '@/models/Donation'
import { User } from '@/models/User'
import { logAnalytics } from '@/lib/auth'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    logger.log('M-Pesa Webhook received:', body)

    // Verificar se é uma confirmação de pagamento
    if (body.status === 'completed' && body.reference) {
      // Buscar doação pela referência
      const donation = await Donation.findOne({ reference: body.reference })
      
      if (donation && donation.status === 'pending') {
        // Atualizar status da doação
        donation.status = 'completed'
        donation.completedAt = new Date()
        donation.mpesaResponse = body
        await donation.save()

        // Atualizar status do usuário
        await User.findByIdAndUpdate(
          donation.userId,
          {
            hasDonated: true,
            donationAmount: donation.amount,
            donationDate: new Date()
          }
        )

        // Log de analytics
        await logAnalytics(
          donation.userId,
          'donation_completed',
          'donation',
          {
            amount: donation.amount,
            reference: donation.reference,
            phone: donation.phone
          }
        )

        logger.log(`Donation ${donation.reference} completed successfully`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    logger.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
