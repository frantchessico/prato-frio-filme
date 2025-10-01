"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { toast } from "sonner"
import { useIsClient } from "@/hooks/use-is-client"

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
  isHydrated: boolean // Added hydration state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const isClient = useIsClient()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasDonated, setHasDonated] = useState(false)
  const [checkingDonation, setCheckingDonation] = useState(false)
  const [donationStatusChecked, setDonationStatusChecked] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false) // Track hydration state

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated || !isClient) return

    // Verificar se há token salvo no localStorage
    try {
      const savedToken = localStorage.getItem("auth_token")
      if (savedToken) {
        try {
          // Verificar se o token é válido antes de usar
          const payload = JSON.parse(atob(savedToken.split(".")[1]))
          const currentTime = Math.floor(Date.now() / 1000)
          
          // Se o token expirou, remover
          if (payload.exp && payload.exp <= currentTime) {
            localStorage.removeItem("auth_token")
            setToken(null)
            setUser(null)
          } else {
            setToken(savedToken)
            const userData = {
              id: payload.id,
              phone: payload.phone,
              firstName: payload.firstName,
              lastName: payload.lastName,
              hasDonated: false, // Será verificado no banco
            }
            setUser(userData)
            setHasDonated(false) // Será verificado no banco
            setDonationStatusChecked(false) // Será verificado no banco
          }
        } catch (error) {
          // Token inválido, remover
          localStorage.removeItem("auth_token")
          setToken(null)
          setUser(null)
        }
      }
    } catch (error) {
      // localStorage não disponível (SSR)
      console.log('localStorage not available during SSR')
    }
    setIsLoading(false)
  }, [isHydrated]) // Depend on hydration state

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
        console.log("[AUTH] Donation status checked:", data.hasDonated, "Expires:", data.donationExpiresAt)
        console.log("[AUTH] User state after donation check:", { 
          isAuthenticated, 
          hasDonated: data.hasDonated, 
          donationStatusChecked: true,
          user: user?.id 
        })
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

  // Verificar status de doação quando usuário estiver autenticado
  useEffect(() => {
    console.log("[AUTH CONTEXT] Checking donation status conditions:", {
      isAuthenticated,
      hasUser: !!user,
      isHydrated,
      userId: user?.id
    })
    
    if (isAuthenticated && user && isHydrated) {
      console.log("[AUTH CONTEXT] Calling checkDonationStatus...")
      checkDonationStatus()
    }
  }, [isAuthenticated, user, isHydrated, checkDonationStatus]) // Include checkDonationStatus in dependencies

  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
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
        setDonationStatusChecked(false) // Será verificado após login
        if (isHydrated) {
          try {
            localStorage.setItem("auth_token", data.token)
            // Salvar token nos cookies para o middleware
            document.cookie = `auth_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`
          } catch (error) {
            console.log('localStorage/document not available')
          }
        }
        
        console.log("[AUTH] Login successful:", {
          userId: data.user.id,
          hasDonated: data.user.hasDonated,
          isAuthenticated: true
        })

        toast.success("Login realizado com sucesso!", {
          description: `Bem-vindo, ${data.user.firstName}!`,
          duration: 3000,
        })

        return true
      } else {
        const errorData = await response.json()
        console.error("Login failed:", errorData.error)

        if (errorData.error === "Usuário não encontrado") {
          toast.error("Usuário não encontrado", {
            description: "Verifique se o número de telefone está correto.",
            duration: 5000,
          })
        } else if (errorData.error === "Senha incorreta") {
          toast.error("Senha incorreta", {
            description: "Verifique sua senha e tente novamente.",
            duration: 5000,
          })
        } else {
          toast.error("Erro no login", {
            description: errorData.error || "Tente novamente em alguns instantes.",
            duration: 5000,
          })
        }

        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Erro de conexão", {
        description: "Verifique sua conexão com a internet e tente novamente.",
        duration: 5000,
      })
      return false
    }
  }

  const register = async (phone: string, firstName: string, lastName: string, password: string): Promise<boolean> => {
    try {
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
          try {
            localStorage.setItem("auth_token", data.token)
            // Salvar token nos cookies para o middleware
            document.cookie = `auth_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`
          } catch (error) {
            console.log('localStorage/document not available')
          }
        }

        toast.success("Conta criada com sucesso!", {
          description: `Bem-vindo, ${data.user.firstName}!`,
          duration: 3000,
        })

        return true
      } else {
        const errorData = await response.json()
        console.error("Register failed:", errorData.error)

        if (errorData.error === "Usuário já existe") {
          toast.error("Usuário já existe", {
            description: "Este número de telefone já está cadastrado. Tente fazer login.",
            duration: 5000,
          })
        } else if (errorData.error === "Formato de telefone inválido") {
          toast.error("Telefone inválido", {
            description: "Verifique se o número de telefone está no formato correto.",
            duration: 5000,
          })
        } else if (errorData.error === "A senha deve ter pelo menos 6 caracteres") {
          toast.error("Senha muito curta", {
            description: "A senha deve ter pelo menos 6 caracteres.",
            duration: 5000,
          })
        } else {
          toast.error("Erro no cadastro", {
            description: errorData.error || "Tente novamente em alguns instantes.",
            duration: 5000,
          })
        }

        return false
      }
    } catch (error) {
      console.error("Register error:", error)
      toast.error("Erro de conexão", {
        description: "Verifique sua conexão com a internet e tente novamente.",
        duration: 5000,
      })
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setHasDonated(false)
    if (isHydrated) {
      try {
        localStorage.removeItem("auth_token")
        // Limpar cookie de autenticação
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      } catch (error) {
        console.log('localStorage/document not available')
      }
    }

    toast.success("Logout realizado", {
      description: "Você foi desconectado com sucesso.",
      duration: 2000,
    })
  }

  const markAsDonated = () => {
    console.log("[AUTH] Marking user as donated")
    setHasDonated(true)
    if (user) {
      const updatedUser = { ...user, hasDonated: true }
      setUser(updatedUser)
      console.log("[AUTH] User updated with donation status:", updatedUser)
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
      {!isHydrated ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        children
      )}
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
