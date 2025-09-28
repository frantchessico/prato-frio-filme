"use client"

import type React from "react"
import { createContext, useContext, useRef, useCallback } from "react"

interface PlayerContextType {
  registerPlayer: (id: string, playerRef: React.RefObject<HTMLElement>) => void
  unregisterPlayer: (id: string) => void
  pauseOtherPlayers: (currentPlayerId: string) => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const playersRef = useRef<Map<string, React.RefObject<HTMLElement>>>(new Map())

  const registerPlayer = useCallback((id: string, playerRef: React.RefObject<HTMLElement>) => {
    playersRef.current.set(id, playerRef)
  }, [])

  const unregisterPlayer = useCallback((id: string) => {
    playersRef.current.delete(id)
  }, [])

  const pauseOtherPlayers = useCallback((currentPlayerId: string) => {
    playersRef.current.forEach((playerRef, id) => {
      if (id !== currentPlayerId && playerRef.current) {
        const player = playerRef.current as any
        if (player && !player.paused) {
          player.pause()
        }
      }
    })
  }, [])

  return (
    <PlayerContext.Provider value={{ registerPlayer, unregisterPlayer, pauseOtherPlayers }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider")
  }
  return context
}
