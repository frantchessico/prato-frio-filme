"use client"

import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Aqui você pode integrar com serviços como Sentry, LogRocket, etc.
      console.error('Error caught by boundary:', error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="text-center p-8 max-w-lg">
            <div className="mb-8">
              <div className="text-6xl mb-4">🎬</div>
              <h1 className="text-4xl font-serif font-bold text-white mb-2">
                Prato Frio
              </h1>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">
                Continue Assistindo
              </h2>
              <p className="text-gray-300 mb-6 text-lg">
                Não deixe que um pequeno problema interrompa sua experiência cinematográfica. 
                Continue assistindo ao filme "Prato Frio" e mergulhe nesta história moçambicana.
              </p>
              
              <div className="space-y-4">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-8 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <RefreshCw className="h-5 w-5 mr-3" />
                  Continuar Assistindo
                </Button>
                
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full border-white/30 text-white hover:bg-white/10 py-4 px-8 text-lg rounded-xl transition-all duration-300"
                >
                  Recarregar Página
                </Button>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  Apoie o cinema moçambicano • Uma produção SavanaPoint
                </p>
              </div>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left bg-gray-900/50 rounded-lg p-4">
                <summary className="text-sm text-gray-400 cursor-pointer hover:text-white transition-colors">
                  🔧 Detalhes técnicos (desenvolvimento)
                </summary>
                <pre className="mt-3 text-xs text-red-400 bg-black/50 p-3 rounded overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
