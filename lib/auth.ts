import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import dbConnect from './mongodb'
import { User, IUser } from '@/models/User'
import { UserSession } from '@/models/UserSession'
import { Analytics } from '@/models/Analytics'

const JWT_SECRET = process.env.JWT_SECRET || 'prato-frio-super-secret-key-2025-mocambique'
const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: { id: string; phone: string; firstName: string; lastName: string; hasDonated?: boolean }): string {
  return jwt.sign(
    {
      id: user.id,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      hasDonated: user.hasDonated || false
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function createUser(phone: string, firstName: string, lastName: string, password: string) {
  await dbConnect()
  
  // Verificar se usuário já existe
  const existingUser = await User.findOne({ phone })
  if (existingUser) {
    throw new Error('Usuário já existe')
  }

  const hashedPassword = await hashPassword(password)
  const user = new User({
    phone,
    firstName,
    lastName,
    passwordHash: hashedPassword,
    hasDonated: false
  })

  await user.save()

  // Log de analytics
  await Analytics.create({
    event: 'user_registered',
    category: 'auth',
    data: { phone, firstName, lastName }
  })

  return {
    id: user._id.toString(),
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    hasDonated: user.hasDonated
  }
}

export async function findUserByPhone(phone: string) {
  await dbConnect()
  return await User.findOne({ phone })
}

export async function findUserById(id: string) {
  await dbConnect()
  return await User.findById(id)
}

export async function authenticateUser(phone: string, password: string) {
  await dbConnect()
  
  const user = await User.findOne({ phone })
  if (!user) {
    throw new Error('Usuário não encontrado')
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash)
  if (!isValidPassword) {
    throw new Error('Senha incorreta')
  }

  // Atualizar último login
  user.lastLogin = new Date()
  await user.save()

  // Log de analytics
  await Analytics.create({
    userId: user._id.toString(),
    event: 'user_login',
    category: 'auth',
    data: { phone }
  })

  return {
    id: user._id.toString(),
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    hasDonated: user.hasDonated
  }
}

export async function createUserSession(userId: string, token: string, deviceInfo?: string, ipAddress?: string, userAgent?: string) {
  await dbConnect()
  
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 dias

  const session = new UserSession({
    userId,
    token,
    deviceInfo,
    ipAddress,
    userAgent,
    expiresAt
  })

  await session.save()
  return session
}

export async function findUserSession(token: string) {
  await dbConnect()
  return await UserSession.findOne({ token, isActive: true })
}

export async function deactivateUserSession(token: string) {
  await dbConnect()
  return await UserSession.findOneAndUpdate(
    { token },
    { isActive: false },
    { new: true }
  )
}

export async function updateUserDonationStatus(userId: string, hasDonated: boolean, donationAmount?: number) {
  await dbConnect()
  
  const updateData: any = { hasDonated }
  if (donationAmount) {
    updateData.donationAmount = donationAmount
    updateData.donationDate = new Date()
    // Definir expiração para 3 dias a partir de agora
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 3)
    updateData.donationExpiresAt = expirationDate
  }

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true }
  )

  if (user) {
    // Log de analytics
    await Analytics.create({
      userId: user._id.toString(),
      event: 'donation_status_updated',
      category: 'donation',
      data: { hasDonated, donationAmount, expiresAt: updateData.donationExpiresAt }
    })
  }

  return user
}

export async function logAnalytics(userId: string | null, event: string, category: 'auth' | 'donation' | 'video' | 'user' | 'system', data?: any, ipAddress?: string, userAgent?: string) {
  await dbConnect()
  
  await Analytics.create({
    userId: userId || undefined,
    event,
    category,
    data,
    ipAddress,
    userAgent,
    timestamp: new Date()
  })
}