import { Client } from "@paymentsds/mpesa"
import { secureLogger } from "@/lib/logger"

// Função para gerar referência numérica única
export function generateReference(): string {
  const digits = Array.from({ length: 10 }, (_, i) => i)

  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[digits[i], digits[j]] = [digits[j], digits[i]]
  }

  const reference = digits.slice(0, 9).join("")
  return reference
}

// Configuração do cliente M-Pesa
export const mpesa = new Client({
  apiKey: process.env.MPESA_APIKEY as string,
  publicKey: process.env.MPESA_PUBLIC_KEY as string,
  serviceProviderCode: process.env.MPESA_SERVICE_PROVIDER_CODE as string,
  host: "api.vm.co.mz",
})

// Função para iniciar uma transação M-Pesa
export async function initiatePayment({
  phoneNumber,
  amount,
}: {
  phoneNumber: string
  amount: number
}) {
  try {
    secureLogger.log("=== INICIANDO PAGAMENTO M-PESA ===")
    secureLogger.log("Telefone:", phoneNumber)
    secureLogger.log("Valor:", amount)

    // Formatar o número de telefone
    let formattedPhone = phoneNumber.replace(/\s+/g, "").replace(/[^\d]/g, "")

    // Se o número começar com 258, remover esse prefixo
    if (formattedPhone.startsWith("258")) {
      formattedPhone = formattedPhone.substring(3)
    }

    secureLogger.log("Telefone formatado:", formattedPhone)

    // Gerar referência única
    const reference = generateReference()
    secureLogger.log("Referência gerada:", reference)

    // Configurar dados do pagamento
    const paymentData = {
      from: formattedPhone,
      transaction: reference,
      reference: reference,
      amount: amount.toString(),
    }

    secureLogger.log("Dados do pagamento:", paymentData)

    // Iniciar a transação
    const payment = await mpesa.receive(paymentData)
    secureLogger.log("Resposta do M-Pesa:", payment)

    return {
      success: true,
      data: payment,
      reference: reference,
      transactionId: reference,
      message: "Pagamento iniciado com sucesso",
    }
  } catch (error: any) {
    secureLogger.error("Erro ao iniciar pagamento M-Pesa:", error)

    return {
      success: false,
      error: error.message || "Erro desconhecido ao processar pagamento",
      message: "Falha ao iniciar pagamento",
    }
  }
}

// Função para processar saques via M-Pesa
export async function processPayout({
  phoneNumber,
  amount,
  reference,
}: {
  phoneNumber: string
  amount: number
  reference: string
}) {
  try {
    secureLogger.log("=== INICIANDO SAQUE M-PESA ===")
    secureLogger.log("Telefone:", phoneNumber)
    secureLogger.log("Valor:", amount)
    secureLogger.log("Referência:", reference)

    // Formatar o número de telefone
    let formattedPhone = phoneNumber.replace(/\s+/g, "").replace(/[^\d]/g, "")

    if (formattedPhone.startsWith("258")) {
      formattedPhone = formattedPhone.substring(3)
    }

    secureLogger.log("Telefone formatado:", formattedPhone)

    // Configurar dados do saque
    const payoutData = {
      to: formattedPhone,
      reference: reference,
      transaction: reference,
      amount: amount.toString(),
    }

    secureLogger.log("Dados do saque:", payoutData)

    // Enviar o dinheiro
    const result = await mpesa.send(payoutData)
    secureLogger.log("Resposta do M-Pesa:", result)

    return {
      success: true,
      data: result,
      reference,
      message: "Saque processado com sucesso",
    }
  } catch (error: any) {
    secureLogger.error("Erro ao processar saque M-Pesa:", error)

    return {
      success: false,
      error: error.message || "Erro desconhecido ao processar saque",
      message: "Falha ao processar saque",
    }
  }
}
