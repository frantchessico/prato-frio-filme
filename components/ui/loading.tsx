import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function Loading({ size = 'md', text, className = '' }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <Loader2 className={`animate-spin ${sizeClasses[size]} text-primary mx-auto`} />
        {text && (
          <p className="text-white/80 text-lg font-medium mt-4">{text}</p>
        )}
      </div>
    </div>
  )
}

export function LoadingScreen({ text = "Carregando..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loading size="lg" text={text} />
    </div>
  )
}
