"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Phone, User, Lock, CheckCircle, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  onShowDonationModal?: () => void
}

export function AuthModal({ open, onOpenChange, onSuccess, onShowDonationModal }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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
          toast.success("Login realizado com sucesso!")
          onSuccess()
        } else {
          // User logged in but hasn't donated - show donation modal
          onOpenChange(false)
          if (onShowDonationModal) {
            onShowDonationModal()
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login")
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
        onOpenChange(false)
        if (onShowDonationModal) {
          onShowDonationModal()
        }
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setError("")
    setPhone("")
    setPassword("")
    setFirstName("")
    setLastName("")
    onOpenChange(false)
  }

  if (hasDonated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <div className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Obrigado pelo Apoio!</h2>
            <p className="text-gray-600 mb-6">Você já fez uma doação e pode assistir ao filme completo.</p>
            <Button onClick={handleClose} className="w-full bg-red-600 hover:bg-red-700 text-white">
              Continuar Assistindo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <div className="p-4 sm:p-6">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? "Já Apoiei" : "Apoiar Agora"}
          </h2>
          <div className="w-16 h-1 bg-red-600 mx-auto rounded-full" />
        </div>

        <Tabs
          value={isLogin ? "login" : "register"}
          onValueChange={(value) => setIsLogin(value === "login")}
          className="space-y-4 sm:space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 border border-gray-300 p-1 rounded-xl h-12 sm:h-14">
            <TabsTrigger
              value="login"
              className="h-10 sm:h-12 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-gray-200"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="h-10 sm:h-12 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-gray-200"
            >
              Cadastro
            </TabsTrigger>
          </TabsList>

          {error && (
            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <TabsContent value="login" className="space-y-3 sm:space-y-4">
            <Card className="bg-white border border-gray-200 shadow-md">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  Fazer Login
                </CardTitle>
                <CardDescription className="text-gray-700 font-medium text-sm">
                  Entre com suas credenciais para continuar assistindo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="login-phone" className="text-black font-bold text-sm">
                      Número de Telefone
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-phone"
                        type="tel"
                        placeholder="+258 84 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 text-black font-medium border-gray-400 h-10 sm:h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="login-password" className="text-black font-bold text-sm">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 text-black font-medium border-gray-400 h-10 sm:h-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 h-10 sm:h-12 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-600/25 hover:scale-[1.02] text-sm sm:text-base rounded-lg border-2 border-red-600"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

          <TabsContent value="register" className="space-y-3 sm:space-y-4">
            <Card className="bg-white border border-gray-200 shadow-md">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  Criar Conta
                </CardTitle>
                <CardDescription className="text-gray-700 font-medium text-sm">
                  Cadastre-se para apoiar o projeto e assistir ao filme completo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="register-firstName" className="text-black font-bold text-sm">
                        Primeiro Nome
                      </Label>
                      <Input
                        id="register-firstName"
                        type="text"
                        placeholder="João"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="text-black font-medium border-gray-400 h-10 sm:h-12"
                        required
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="register-lastName" className="text-black font-bold text-sm">
                        Último Nome
                      </Label>
                      <Input
                        id="register-lastName"
                        type="text"
                        placeholder="Silva"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="text-black font-medium border-gray-400 h-10 sm:h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="register-phone" className="text-black font-bold text-sm">
                      Número de Telefone
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="+258 84 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 text-black font-medium border-gray-400 h-10 sm:h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="register-password" className="text-black font-bold text-sm">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 text-black font-medium border-gray-400 h-10 sm:h-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 h-10 sm:h-12 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-600/25 hover:scale-[1.02] text-sm sm:text-base rounded-lg border-2 border-red-600"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
