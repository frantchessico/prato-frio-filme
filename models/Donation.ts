import mongoose, { Document, Schema } from 'mongoose'

export interface IDonation extends Document {
  _id: string
  userId: string
  phone: string
  amount: number
  reference: string
  transactionId?: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  mpesaResponse?: any
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const DonationSchema = new Schema<IDonation>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 99
  },
  reference: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  transactionId: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  mpesaResponse: {
    type: Schema.Types.Mixed,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// Índices para otimização
DonationSchema.index({ userId: 1 })
DonationSchema.index({ phone: 1 })
DonationSchema.index({ status: 1 })
DonationSchema.index({ createdAt: -1 })

export const Donation = mongoose.models.Donation || mongoose.model<IDonation>('Donation', DonationSchema)
