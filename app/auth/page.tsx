"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingScreen } from "@/components/ui/loading"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Phone, Lock, User, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useEffect } from "react"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const showDonation = searchParams.get("donation") === "true"

  const { login, register, isAuthenticated, isHydrated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Redirecionar usuários já autenticados para home
  useEffect(() => {
    if (isAuthenticated && isHydrated) {
      router.push("/")
    }
  }, [isAuthenticated, isHydrated, router])

  // Mostrar loading enquanto verifica hidratação
  if (!isHydrated) {
    return <LoadingScreen text="Carregando..." />
  }

  // Se usuário está autenticado, não mostrar a página (será redirecionado)
  if (isAuthenticated) {
    return null
  }

  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loginPhone, setLoginPhone] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const [registerFirstName, setRegisterFirstName] = useState("")
  const [registerLastName, setRegisterLastName] = useState("")
  const [registerPhone, setRegisterPhone] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(loginPhone, loginPassword)
      if (success) {
        setLoginPhone("")
        setLoginPassword("")
        // Redirecionar para home após login bem-sucedido
        router.push("/")
      } else {
        setError("Erro ao fazer login")
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (registerPassword !== registerConfirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (registerPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setIsLoading(true)

    try {
      const success = await register(registerFirstName, registerLastName, registerPhone, registerPassword)
      if (success) {
        setRegisterFirstName("")
        setRegisterLastName("")
        setRegisterPhone("")
        setRegisterPassword("")
        setRegisterConfirmPassword("")
        // Redirecionar para home após registro bem-sucedido
        router.push("/")
      } else {
        setError("Erro ao criar conta")
      }
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-black">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <h1 className="text-5xl font-serif font-bold text-white mb-3 group-hover:text-primary transition-colors">
              Prato Frio
            </h1>
          </Link>
          <p className="text-muted-foreground text-lg">{showDonation ? "Apoie o projeto" : "Bem-vindo de volta"}</p>
        </div>

        <Card className="border-border bg-card shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-serif text-center">Autenticação</CardTitle>
            <CardDescription className="text-center">
              {showDonation ? "Faça login ou crie uma conta para continuar" : "Entre com sua conta ou crie uma nova"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Criar Conta
                </TabsTrigger>
              </TabsList>

              {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
              )}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-phone" className="text-sm font-medium">
                      Número de Telefone
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="login-phone"
                        type="tel"
                        placeholder="+258 84 123 4567"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pl-11 h-12 bg-input border-border focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pl-11 pr-11 h-12 bg-input border-border focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold text-base mt-6"
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-first-name" className="text-sm font-medium">
                        Primeiro Nome
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="register-first-name"
                          type="text"
                          placeholder="João"
                          value={registerFirstName}
                          onChange={(e) => setRegisterFirstName(e.target.value)}
                          required
                          disabled={isLoading}
                          className="pl-11 h-12 bg-input border-border focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-last-name" className="text-sm font-medium">
                        Último Nome
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="register-last-name"
                          type="text"
                          placeholder="Silva"
                          value={registerLastName}
                          onChange={(e) => setRegisterLastName(e.target.value)}
                          required
                          disabled={isLoading}
                          className="pl-11 h-12 bg-input border-border focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-phone" className="text-sm font-medium">
                      Número de Telefone
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="+258 84 123 4567"
                        value={registerPhone}
                        onChange={(e) => setRegisterPhone(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pl-11 h-12 bg-input border-border focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm font-medium">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pl-11 pr-11 h-12 bg-input border-border focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showRegisterPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password" className="text-sm font-medium">
                      Confirmar Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="register-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pl-11 pr-11 h-12 bg-input border-border focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold text-base mt-6"
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando conta..." : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-8 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para o início
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
