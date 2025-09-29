declare module '@paymentsds/mpesa' {
  export interface MpesaConfig {
    apiKey: string
    publicKey: string
    serviceProviderCode: string
    host?: string
  }

  export interface PaymentData {
    from: string
    transaction: string
    reference: string
    amount: string
  }

  export interface PayoutData {
    to: string
    reference: string
    transaction: string
    amount: string
  }

  export interface MpesaResponse {
    success: boolean
    data?: any
    error?: string
    message?: string
  }

  export class Client {
    constructor(config: MpesaConfig)
    
    receive(data: PaymentData): Promise<MpesaResponse>
    send(data: PayoutData): Promise<MpesaResponse>
  }
}
