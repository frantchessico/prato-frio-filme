import mongoose, { Document, Schema } from 'mongoose'

export interface IAnalytics extends Document {
  _id: string
  userId?: string
  event: string
  category: 'auth' | 'donation' | 'video' | 'user' | 'system'
  data?: any
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  createdAt: Date
}

const AnalyticsSchema = new Schema<IAnalytics>({
  userId: {
    type: String,
    ref: 'User',
    default: null
  },
  event: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['auth', 'donation', 'video', 'user', 'system'],
    required: true
  },
  data: {
    type: Schema.Types.Mixed,
    default: null
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Índices para otimização
AnalyticsSchema.index({ userId: 1 })
AnalyticsSchema.index({ event: 1 })
AnalyticsSchema.index({ category: 1 })
AnalyticsSchema.index({ timestamp: -1 })
AnalyticsSchema.index({ createdAt: -1 })

export const Analytics = mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema)
