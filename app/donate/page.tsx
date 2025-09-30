"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Heart } from "lucide-react"

const DONATION_AMOUNTS = [
  { value: "50", label: "50 MZN" },
  { value: "100", label: "100 MZN" },
  { value: "200", label: "200 MZN" },
  { value: "500", label: "500 MZN" },
]

export default function DonatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/"

  const { isAuthenticated, user, isHydrated, hasDonated, donationStatusChecked } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [selectedAmount, setSelectedAmount] = useState("100")
  const [customAmount, setCustomAmount] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")

  // Aguardar hidratação antes de fazer verificações
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/80 text-lg font-medium">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se usuário já doou, redirecionar para home
  if (isAuthenticated && donationStatusChecked && hasDonated) {
    router.push("/")
    return null
  }

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const amount = customAmount || selectedAmount

    if (!amount || Number.parseInt(amount) < 99) {
      setError("O valor mínimo de doação é 99 MZN")
      setIsLoading(false)
      return
    }

    if (!phoneNumber || phoneNumber.length < 9) {
      setError("Por favor, insira um número de telefone válido")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/donation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number.parseInt(amount),
          phoneNumber,
          userId: user?.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Redirecionar para home após doação bem-sucedida
        setTimeout(() => {
          router.push("/")
        }, 3000)
      } else {
        setError(data.error || "Erro ao processar doação")
      }
    } catch (err) {
      setError("Erro ao processar doação. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    router.push(`/auth?redirect=/donate&donation=true`)
    return null
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background to-muted">
        <Card className="w-full max-w-md border-border/50 shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-green-500 fill-green-500" />
              </div>
              <h2 className="text-2xl font-serif font-bold">Obrigado pelo seu apoio!</h2>
              <p className="text-muted-foreground">
                Sua doação foi processada com sucesso. Você será redirecionado em breve.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background to-muted">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-serif font-bold text-primary mb-2">Prato Frio</h1>
          </Link>
          <p className="text-muted-foreground">Apoie o projeto e continue assistindo</p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-serif flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              Fazer Doação
            </CardTitle>
            <CardDescription>Sua contribuição ajuda a manter o projeto ativo e acessível para todos</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleDonation} className="space-y-6">
              <div className="space-y-3">
                <Label>Escolha o valor</Label>
                <RadioGroup value={selectedAmount} onValueChange={setSelectedAmount}>
                  <div className="grid grid-cols-2 gap-3">
                    {DONATION_AMOUNTS.map((amount) => (
                      <div key={amount.value} className="relative">
                        <RadioGroupItem value={amount.value} id={amount.value} className="peer sr-only" />
                        <Label
                          htmlFor={amount.value}
                          className="flex items-center justify-center rounded-lg border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                        >
                          {amount.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-amount">Ou insira outro valor (MZN)</Label>
                <Input
                  id="custom-amount"
                  type="number"
                  placeholder="Valor personalizado"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  disabled={isLoading}
                  min="99"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-number">Número de Telefone (M-Pesa)</Label>
                <Input
                  id="phone-number"
                  type="tel"
                  placeholder="84 123 4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Você receberá uma notificação M-Pesa para confirmar o pagamento
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Processando..." : `Doar ${customAmount || selectedAmount} MZN`}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href={redirectTo} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Voltar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
