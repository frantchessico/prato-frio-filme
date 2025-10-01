"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { toast } from "sonner"

interface User {
  id: string
  phone: string
  firstName: string
  lastName: string
  hasDonated?: boolean
  donationExpiresAt?: Date
  isExpired?: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  hasDonated: boolean
  login: (phone: string, password: string) => Promise<boolean>
  register: (phone: string, firstName: string, lastName: string, password: string) => Promise<boolean>
  logout: () => void
  markAsDonated: () => void
  checkDonationStatus: () => Promise<boolean>
  isLoading: boolean
  checkingDonation: boolean
  donationStatusChecked: boolean
  isHydrated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasDonated, setHasDonated] = useState(false)
  const [checkingDonation, setCheckingDonation] = useState(false)
  const [donationStatusChecked, setDonationStatusChecked] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hidratação simples
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Carregar dados do localStorage apenas após hidratação
  useEffect(() => {
    if (!isHydrated) return

    const loadAuthData = () => {
      try {
        const savedToken = localStorage.getItem("auth_token")
        if (savedToken) {
          const payload = JSON.parse(atob(savedToken.split(".")[1]))
          const currentTime = Math.floor(Date.now() / 1000)
          
          if (payload.exp && payload.exp > currentTime) {
            setToken(savedToken)
            setUser({
              id: payload.id,
              phone: payload.phone,
              firstName: payload.firstName,
              lastName: payload.lastName,
              hasDonated: false,
            })
          } else {
            localStorage.removeItem("auth_token")
          }
        }
      } catch (error) {
        localStorage.removeItem("auth_token")
      }
    }

    loadAuthData()
  }, [isHydrated])

  const isAuthenticated = !!user && !!token

  const checkDonationStatus = useCallback(async () => {
    if (!user || !token) return false

    try {
      setCheckingDonation(true)
      const response = await fetch("/api/user/donation-status", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setHasDonated(data.hasDonated)
        setDonationStatusChecked(true)
        if (user) {
          setUser({ 
            ...user, 
            hasDonated: data.hasDonated,
            donationExpiresAt: data.donationExpiresAt,
            isExpired: data.isExpired
          })
        }
        return data.hasDonated
      }
      return false
    } catch (error) {
      console.error("[AUTH] Error checking donation status:", error)
      return false
    } finally {
      setCheckingDonation(false)
    }
  }, [user, token])

  useEffect(() => {
    if (isAuthenticated && user && isHydrated) {
      checkDonationStatus()
    }
  }, [isAuthenticated, user, isHydrated, checkDonationStatus])

  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setToken(data.token)
        setUser(data.user)
        setHasDonated(data.user.hasDonated || false)
        
        if (isHydrated) {
          localStorage.setItem("auth_token", data.token)
          document.cookie = `auth_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`
        }
        
        toast.success("Login realizado com sucesso!", {
          description: `Bem-vindo, ${data.user.firstName}!`,
          duration: 3000,
        })

        return true
      } else {
        const errorData = await response.json()
        toast.error("Erro no login", {
          description: errorData.error || "Tente novamente em alguns instantes.",
          duration: 5000,
        })
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Erro de conexão", {
        description: "Verifique sua conexão com a internet e tente novamente.",
        duration: 5000,
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (phone: string, firstName: string, lastName: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, firstName, lastName, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setToken(data.token)
        setUser(data.user)
        setHasDonated(data.user.hasDonated || false)
        
        if (isHydrated) {
          localStorage.setItem("auth_token", data.token)
          document.cookie = `auth_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`
        }

        toast.success("Conta criada com sucesso!", {
          description: `Bem-vindo, ${data.user.firstName}!`,
          duration: 3000,
        })

        return true
      } else {
        const errorData = await response.json()
        toast.error("Erro no cadastro", {
          description: errorData.error || "Tente novamente em alguns instantes.",
          duration: 5000,
        })
        return false
      }
    } catch (error) {
      console.error("Register error:", error)
      toast.error("Erro de conexão", {
        description: "Verifique sua conexão com a internet e tente novamente.",
        duration: 5000,
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setHasDonated(false)
    
    if (isHydrated) {
      localStorage.removeItem("auth_token")
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }

    toast.success("Logout realizado", {
      description: "Você foi desconectado com sucesso.",
      duration: 2000,
    })
  }

  const markAsDonated = () => {
    setHasDonated(true)
    if (user) {
      setUser({ ...user, hasDonated: true })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        hasDonated,
        login,
        register,
        logout,
        markAsDonated,
        checkDonationStatus,
        isLoading,
        checkingDonation,
        donationStatusChecked,
        isHydrated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
