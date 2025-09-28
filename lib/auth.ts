import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'prato-frio-super-secret-key-2024-mocambique'
const SALT_ROUNDS = 10

// Simulação de banco de dados em memória (em produção, usar banco real)
const users: Array<{
  id: string
  phone: string
  firstName: string
  lastName: string
  password: string
  createdAt: Date
}> = []

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: { id: string; phone: string; firstName: string; lastName: string }): string {
  return jwt.sign(
    {
      id: user.id,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName
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
  // Verificar se usuário já existe
  const existingUser = users.find(u => u.phone === phone)
  if (existingUser) {
    throw new Error('Usuário já existe')
  }

  const hashedPassword = await hashPassword(password)
  const user = {
    id: Date.now().toString(),
    phone,
    firstName,
    lastName,
    password: hashedPassword,
    createdAt: new Date()
  }

  users.push(user)
  return user
}

export async function findUserByPhone(phone: string) {
  return users.find(u => u.phone === phone)
}

export async function authenticateUser(phone: string, password: string) {
  const user = await findUserByPhone(phone)
  if (!user) {
    throw new Error('Usuário não encontrado')
  }

  const isValidPassword = await verifyPassword(password, user.password)
  if (!isValidPassword) {
    throw new Error('Senha incorreta')
  }

  return user
}
