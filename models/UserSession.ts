import mongoose, { Document, Schema } from 'mongoose'

export interface IUserSession extends Document {
  _id: string
  userId: string
  token: string
  deviceInfo?: string
  ipAddress?: string
  userAgent?: string
  isActive: boolean
  expiresAt: Date
  lastActivity: Date
  createdAt: Date
  updatedAt: Date
}

const UserSessionSchema = new Schema<IUserSession>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  deviceInfo: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Índices para otimização
UserSessionSchema.index({ userId: 1 })
UserSessionSchema.index({ isActive: 1 })
UserSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL index

export const UserSession = mongoose.models.UserSession || mongoose.model<IUserSession>('UserSession', UserSessionSchema)
