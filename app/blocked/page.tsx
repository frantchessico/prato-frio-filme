import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acesso Restrito',
  description: 'Este conteúdo está disponível apenas em Moçambique',
  robots: {
    index: false,
    follow: false,
  },
}

export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Acesso Restrito
          </h1>
          <p className="text-lg text-muted-foreground">
            Este site está disponível apenas em Moçambique
          </p>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Para sua segurança e para garantir a disponibilidade do conteúdo conforme as políticas de distribuição, 
            este site só pode ser acessado a partir de Moçambique.
          </p>
          
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Se você está em Moçambique e continua vendo esta mensagem, 
              entre em contato com o suporte.
            </p>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Prato Frio - Filme Moçambicano
        </div>
      </div>
    </div>
  )
}

