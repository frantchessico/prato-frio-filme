"use client"

import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  ariaLabel?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  ariaLabel = 'Carregando' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div 
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label={ariaLabel}
    >
      <span className="sr-only">{ariaLabel}</span>
    </div>
  )
}

export function LoadingOverlay({ 
  message = 'Carregando...',
  className = ''
}: { 
  message?: string
  className?: string 
}) {
  return (
    <div 
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-message"
    >
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p id="loading-message" className="text-white text-sm font-medium">
          {message}
        </p>
      </div>
    </div>
  )
}
