"use client"

import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/auth-context-simple'
import { PlayerProvider } from '@/contexts/player-context'
import { AccessibilityProvider } from '@/components/accessibility-provider'
import { HydrationBoundary } from '@/components/hydration-boundary'
import { LoadingScreen } from '@/components/ui/loading'

interface ProvidersWrapperProps {
  children: ReactNode
}

export function ProvidersWrapper({ children }: ProvidersWrapperProps) {
  return (
    <HydrationBoundary fallback={<LoadingScreen text="Carregando aplicação..." />}>
      <AccessibilityProvider>
        <AuthProvider>
          <PlayerProvider>
            {children}
          </PlayerProvider>
        </AuthProvider>
      </AccessibilityProvider>
    </HydrationBoundary>
  )
}
