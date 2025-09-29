"use client"

import React, { Suspense } from 'react'
import { LoadingSpinner } from './loading-spinner'

interface LazyVideoPlayerProps {
  playbackId: string
  className?: string
  onLoadStart?: () => void
  onLoadedData?: () => void
  onError?: (error: any) => void
  [key: string]: any
}

export function LazyVideoPlayer({ 
  playbackId, 
  className = '', 
  onLoadStart,
  onLoadedData,
  onError,
  ...props 
}: LazyVideoPlayerProps) {
  return (
    <Suspense 
      fallback={
        <div className={`flex items-center justify-center bg-black rounded-2xl ${className}`}>
          <LoadingSpinner size="lg" ariaLabel="Carregando player de vídeo" />
        </div>
      }
    >
      <mux-player
        playback-id={playbackId}
        className={className}
        onLoadStart={onLoadStart}
        onLoadedData={onLoadedData}
        onError={onError}
        {...props}
      />
    </Suspense>
  )
}
