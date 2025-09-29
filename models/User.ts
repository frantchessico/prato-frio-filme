import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  _id: string
  phone: string
  firstName: string
  lastName: string
  passwordHash: string
  hasDonated: boolean
  donationAmount?: number
  donationDate?: Date
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  hasDonated: {
    type: Boolean,
    default: false
  },
  donationAmount: {
    type: Number,
    default: 0
  },
  donationDate: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// Índices para otimização
UserSchema.index({ phone: 1 })
UserSchema.index({ hasDonated: 1 })
UserSchema.index({ createdAt: -1 })

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
