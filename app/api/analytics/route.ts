import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Analytics } from '@/models/Analytics'
import { User } from '@/models/User'
import { Donation } from '@/models/Donation'
import { UserSession } from '@/models/UserSession'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d' // 7d, 30d, 90d, 1y
    const category = searchParams.get('category') // auth, donation, video, user, system

    // Calcular data de início baseada no período
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Construir filtro
    const filter: any = {
      createdAt: { $gte: startDate }
    }
    
    if (category) {
      filter.category = category
    }

    // Buscar analytics
    const analytics = await Analytics.find(filter)
      .sort({ createdAt: -1 })
      .limit(1000)

    // Estatísticas gerais
    const totalUsers = await User.countDocuments()
    const totalDonations = await Donation.countDocuments()
    const totalAmount = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    // Eventos por categoria
    const eventsByCategory = await Analytics.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ])

    // Eventos por dia (últimos 30 dias)
    const eventsByDay = await Analytics.aggregate([
      { 
        $match: { 
          createdAt: { 
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
          } 
        } 
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Usuários ativos
    const activeUsers = await UserSession.countDocuments({
      isActive: true,
      lastActivity: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })

    // Doações por status
    const donationsByStatus = await Donation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])

    return NextResponse.json({
      success: true,
      data: {
        period,
        startDate,
        endDate: now,
        summary: {
          totalUsers,
          totalDonations,
          totalAmount: totalAmount[0]?.total || 0,
          activeUsers
        },
        analytics: {
          totalEvents: analytics.length,
          eventsByCategory,
          eventsByDay,
          donationsByStatus
        },
        recentEvents: analytics.slice(0, 50)
      }
    })

  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
