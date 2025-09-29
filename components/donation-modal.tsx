"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Loader2, Heart, CheckCircle, AlertCircle, Phone, CreditCard } from "lucide-react"

interface DonationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const DONATION_AMOUNTS = [
  { value: 99, label: "99 MZN", popular: false },
  { value: 150, label: "150 MZN", popular: true },
  { value: 250, label: "250 MZN", popular: false },
  { value: 500, label: "500 MZN", popular: false },
  { value: 1000, label: "1000 MZN", popular: false },
]

export function DonationModal({ isOpen, onClose, onSuccess }: DonationModalProps) {
  const [selectedAmount, setSelectedAmount] = useState(99)
  const [customAmount, setCustomAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)

  const { user, token, markAsDonated } = useAuth()

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const amount = customAmount ? parseInt(customAmount) : selectedAmount

      if (amount < 99) {
        setError("Valor mínimo de doação é 99 MZN")
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/donation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phoneNumber: user?.phone,
          amount: amount
        })
      })

      const result = await response.json()

      if (result.success) {
        setPaymentData(result)
        setSuccess(true)
        
        // Marcar usuário como doador
        markAsDonated()
        
        toast.success('Doação iniciada com sucesso!', {
          description: 'Verifique seu telefone para confirmar o pagamento.',
          duration: 5000,
        })
        
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 3000)
      } else {
        const errorMessage = result.error || "Erro ao processar doação"
        setError(errorMessage)
        
        toast.error('Erro na doação', {
          description: errorMessage,
          duration: 5000,
        })
      }
    } catch (error) {
      const errorMessage = "Erro ao processar doação"
      setError(errorMessage)
      
      toast.error('Erro de conexão', {
        description: 'Verifique sua conexão e tente novamente.',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedAmount(99)
    setCustomAmount("")
    setError("")
    setSuccess(false)
    setPaymentData(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (success && paymentData) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-card border border-border/50 shadow-2xl">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <CheckCircle className="relative h-20 w-20 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-center mb-3 text-foreground">
              Doação Iniciada!
            </h3>
            <p className="text-muted-foreground text-center text-lg mb-4">
              Verifique seu telefone para confirmar o pagamento
            </p>
            <div className="bg-muted/50 rounded-lg p-4 w-full">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex justify-between">
                  <span>Referência:</span>
                  <span className="font-mono">{paymentData.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span>Telefone:</span>
                  <span>{user?.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-card border border-border/50 shadow-2xl backdrop-blur-sm">
        <DialogHeader className="space-y-2 pb-4">
          <DialogTitle className="text-center text-2xl font-bold text-foreground">
            Apoiar o Projeto
          </DialogTitle>
          <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
        </DialogHeader>

        <Card className="bg-card/50 border border-border/50 shadow-lg backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-foreground font-bold text-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Heart className="h-4 w-4 text-primary" />
              </div>
              Faça sua Doação
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Apoie o projeto "Prato Frio" com uma doação via M-Pesa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleDonation} className="space-y-4">
              {/* Valores pré-definidos */}
              <div className="space-y-2">
                <Label className="text-foreground font-semibold text-sm">
                  Escolha o valor da doação
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {DONATION_AMOUNTS.map((amount) => (
                    <Button
                      key={amount.value}
                      type="button"
                      variant={selectedAmount === amount.value ? "default" : "outline"}
                      className={`h-10 transition-all duration-200 ${
                        selectedAmount === amount.value
                          ? "bg-primary text-white"
                          : "border-border/50 hover:border-primary/50"
                      } ${
                        amount.popular ? "ring-2 ring-primary/30" : ""
                      }`}
                      onClick={() => {
                        setSelectedAmount(amount.value)
                        setCustomAmount("")
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-semibold text-sm">{amount.label}</span>
                        {amount.popular && (
                          <span className="text-xs text-primary">Popular</span>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Valor customizado */}
              <div className="space-y-2">
                <Label htmlFor="custom-amount" className="text-foreground font-semibold text-sm">
                  Ou digite um valor personalizado
                </Label>
                <div className="relative group">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="Digite o valor (mínimo 99 MZN)"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setSelectedAmount(0)
                    }}
                    className="pl-10 h-10 bg-input border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground rounded-lg"
                    min="99"
                  />
                </div>
              </div>

              {/* Informações do usuário */}
              <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>Pagamento será processado para:</span>
                </div>
                <div className="text-foreground font-semibold text-sm">
                  {user?.phone}
                </div>
                <div className="text-xs text-muted-foreground">
                  Você receberá uma notificação no seu telefone para confirmar o pagamento
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-lg font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 h-10 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02] text-sm rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    Apoiar Projeto
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
