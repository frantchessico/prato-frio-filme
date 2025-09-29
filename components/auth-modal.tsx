"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { DonationModal } from "@/components/donation-modal"
import { Loader2, Phone, User, Lock, CheckCircle, Eye, EyeOff } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showDonationModal, setShowDonationModal] = useState(false)

  // Estados do formulário
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  const { login, register, hasDonated } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = await login(phone, password)
      if (success) {
        if (hasDonated) {
          setSuccess(true)
          setTimeout(() => {
            onSuccess()
            onClose()
          }, 1500)
        } else {
          // Usuário logado mas não doou - mostrar modal de doação
          setShowDonationModal(true)
        }
      } else {
        setError("Telefone ou senha incorretos")
      }
    } catch (error) {
      setError("Erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = await register(phone, firstName, lastName, password)
      if (success) {
        setShowDonationModal(true)
      } else {
        setError("Erro ao criar conta. Telefone pode já estar em uso.")
      }
    } catch (error) {
      setError("Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setPhone("")
    setPassword("")
    setFirstName("")
    setLastName("")
    setError("")
    setSuccess(false)
    setShowPassword(false)
    setShowDonationModal(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-card border border-border/50 shadow-2xl">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <CheckCircle className="relative h-20 w-20 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-center mb-3 text-foreground">
              {isLogin ? "Login realizado com sucesso!" : "Conta criada com sucesso!"}
            </h3>
            <p className="text-muted-foreground text-center text-lg">Agora você pode assistir ao filme completo!</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card border border-border/50 shadow-2xl backdrop-blur-sm">
        <DialogHeader className="space-y-4 pb-6">
          <DialogTitle className="text-center text-3xl font-bold text-foreground">
            {isLogin ? "Já Apoiei" : "Apoiar Agora"}
          </DialogTitle>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
        </DialogHeader>

        <Tabs
          value={isLogin ? "login" : "register"}
          onValueChange={(value) => setIsLogin(value === "login")}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 bg-muted/20 border border-border/30 p-1 rounded-xl backdrop-blur-sm h-14">
            <TabsTrigger
              value="login"
              className="h-12 rounded-lg font-semibold text-base transition-all duration-300 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/30"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="h-12 rounded-lg font-semibold text-base transition-all duration-300 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/30"
            >
              Registrar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-0">
            <Card className="bg-card/50 border border-border/50 shadow-lg backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-foreground font-bold text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  Fazer Login
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  Entre com seu telefone e senha para continuar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="login-phone" className="text-foreground font-semibold text-sm">
                      Telefone
                    </Label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="login-phone"
                        type="tel"
                        placeholder="+258 84 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-12 h-12 bg-input border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="login-password" className="text-foreground font-semibold text-sm">
                      Senha
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 pr-12 h-12 bg-input border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground rounded-lg"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-4 rounded-lg font-medium">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 h-12 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-600/25 hover:scale-[1.02] text-base rounded-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="space-y-0">
            <Card className="bg-card/50 border border-border/50 shadow-lg backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-foreground font-bold text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  Criar Conta
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  Preencha os dados para apoiar o projeto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="register-phone" className="text-foreground font-semibold text-sm">
                      Telefone
                    </Label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="+258 84 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-12 h-12 bg-input border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="register-firstName" className="text-foreground font-semibold text-sm">
                        Primeiro Nome
                      </Label>
                      <Input
                        id="register-firstName"
                        type="text"
                        placeholder="João"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-12 bg-input border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground rounded-lg"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="register-lastName" className="text-foreground font-semibold text-sm">
                        Último Nome
                      </Label>
                      <Input
                        id="register-lastName"
                        type="text"
                        placeholder="Silva"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-12 bg-input border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="register-password" className="text-foreground font-semibold text-sm">
                      Senha
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 pr-12 h-12 bg-input border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground rounded-lg"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>


                  {error && (
                    <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-4 rounded-lg font-medium">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 h-12 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-600/25 hover:scale-[1.02] text-base rounded-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      "Criar Conta"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Modal de Doação */}
      <DonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        onSuccess={() => {
          setShowDonationModal(false)
          setSuccess(true)
          setTimeout(() => {
            onSuccess()
            onClose()
          }, 1500)
        }}
      />
    </Dialog>
  )
}
