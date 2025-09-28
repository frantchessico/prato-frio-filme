"use client"

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Clock, Lock } from 'lucide-react'

interface TimeIndicatorProps {
  currentTime: number
  timeLimit: number
  isAuthenticated: boolean
}

export function TimeIndicator({ currentTime, timeLimit, isAuthenticated }: TimeIndicatorProps) {
  const progress = Math.min((currentTime / timeLimit) * 100, 100)
  const remainingTime = Math.max(timeLimit - currentTime, 0)
  const minutes = Math.floor(remainingTime / 60)
  const seconds = Math.floor(remainingTime % 60)

  if (isAuthenticated) {
    return null // Não mostrar para usuários autenticados
  }

  return (
    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-white/20 z-10">
      <div className="flex items-center gap-2 text-white">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">
          {minutes}:{seconds.toString().padStart(2, '0')} restantes
        </span>
      </div>
      <Progress 
        value={progress} 
        className="w-32 h-2 mt-2"
        style={{
          '--progress-background': 'rgba(255, 255, 255, 0.2)',
          '--progress-foreground': progress >= 100 ? '#ef4444' : '#d4312c'
        } as React.CSSProperties}
      />
      {progress >= 100 && (
        <div className="flex items-center gap-1 mt-2 text-red-400 text-xs">
          <Lock className="h-3 w-3" />
          <span>Autenticação necessária</span>
        </div>
      )}
    </div>
  )
}
