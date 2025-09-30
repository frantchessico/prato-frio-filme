"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Loader2, Heart, CheckCircle, AlertCircle, Phone, CreditCard } from "lucide-react"

interface DonationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const DONATION_AMOUNTS = [
  { value: 99, label: "99 MZN", popular: true },
  { value: 150, label: "150 MZN" },
  { value: 200, label: "200 MZN" },
  { value: 300, label: "300 MZN" },
  { value: 500, label: "500 MZN" },
  { value: 1000, label: "1000 MZN" },
]

export function DonationModal({ open, onOpenChange, onSuccess }: DonationModalProps) {
  const [selectedAmount, setSelectedAmount] = useState(99)
  const [customAmount, setCustomAmount] = useState("")
  const [phone, setPhone] = useState("")
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
      const amount = customAmount ? Number.parseInt(customAmount) : selectedAmount

      if (amount < 99) {
        setError("O valor mínimo é 99 MZN")
        return
      }

      const response = await fetch("/api/donation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          phone,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao processar doação")
      }

      const data = await response.json()
      setPaymentData(data)
      setSuccess(true)

      toast.success("Doação iniciada com sucesso!")

      // Simular confirmação após 3 segundos
      setTimeout(() => {
        markAsDonated()
        onSuccess()
        toast.success("Doação confirmada! Obrigado pelo apoio!")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Erro ao processar doação")
      toast.error(err.message || "Erro ao processar doação")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setError("")
    setPhone("")
    setCustomAmount("")
    setSuccess(false)
    setPaymentData(null)
    onOpenChange(false)
  }

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <div className="text-center">
            <div className="mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Doação Processada!</h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Sua doação está sendo processada. Você receberá uma confirmação em breve.
              </p>
              {paymentData && (
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-left">
                  <p className="text-xs sm:text-sm text-gray-600">
                    <strong>Referência:</strong> {paymentData.reference}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    <strong>Valor:</strong> {paymentData.amount} MZN
                  </p>
                </div>
              )}
            </div>
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
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Apoie o Projeto</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Faça uma doação para continuar assistindo ao filme completo
          </p>
        </div>

        <Card className="bg-white border border-gray-200 shadow-md">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              Doação via M-Pesa
            </CardTitle>
            <CardDescription className="text-gray-700 text-sm">
              Escolha o valor e complete a doação para desbloquear o filme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDonation} className="space-y-4 sm:space-y-6">
              <div>
                <Label className="text-black font-bold mb-2 sm:mb-3 block text-sm">Escolha o Valor</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {DONATION_AMOUNTS.map((amount) => (
                    <button
                      key={amount.value}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amount.value)
                        setCustomAmount("")
                      }}
                      className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 text-sm sm:text-base ${
                        selectedAmount === amount.value
                          ? "border-red-600 bg-red-50 text-red-700"
                          : "border-gray-300 hover:border-gray-400"
                      } ${amount.popular ? "ring-2 ring-red-200" : ""}`}
                    >
                      <div className="font-semibold">{amount.label}</div>
                      {amount.popular && <div className="text-xs text-red-600 font-medium">Popular</div>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="custom-amount" className="text-black font-bold text-sm">
                  Ou digite um valor personalizado (mín. 99 MZN)
                </Label>
                <Input
                  id="custom-amount"
                  type="number"
                  placeholder="Digite o valor"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    if (e.target.value) {
                      setSelectedAmount(0)
                    }
                  }}
                  className="text-black font-medium border-gray-400 h-10 sm:h-12 mt-1.5 sm:mt-2"
                  min="99"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-black font-bold text-sm">
                  Número do M-Pesa
                </Label>
                <div className="relative mt-1.5 sm:mt-2">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+258 84 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 text-black font-medium border-gray-400 h-10 sm:h-12"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 h-10 sm:h-12 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-600/25 hover:scale-[1.02] text-sm sm:text-base rounded-lg border-2 border-red-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    Doar {customAmount ? `${customAmount} MZN` : `${selectedAmount} MZN`}
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
