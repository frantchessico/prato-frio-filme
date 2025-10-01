"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect, useCallback } from "react"
import { Languages } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePlayer } from "@/contexts/player-context"
// Removed PlayerControls import - using native Mux controls

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "mux-player": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        "playback-id"?: string
        "metadata-video-title"?: string
        "metadata-viewer-user-id"?: string
        "accent-color"?: string
        "primary-color"?: string
        "secondary-color"?: string
        "stream-type"?: string
        "prefer-mse"?: boolean
        "disable-cookies"?: boolean
        crossorigin?: string
        preload?: string
        muted?: boolean
        autoplay?: boolean
        loop?: boolean
        controls?: boolean
        playsinline?: boolean
        "default-show-remaining-time"?: boolean
      }
    }
  }
}

const TRAILER_LANGUAGE_OPTIONS = [
  {
    code: "pt-MZ",
    name: "Português (Moçambique)",
    flag: "🇲🇿",
    playbackId: "MkuXX33x5Vz029OPuKx4w8zp01DsqWKZAuufOnMG3wx9s",
  },
  {
    code: "pt-BR",
    name: "Português (Brasil)",
    flag: "🇧🇷",
    playbackId: "MkuXX33x5Vz029OPuKx4w8zp01DsqWKZAuufOnMG3wx9s",
  },
]

export function TrailerSection() {
  const playerRef = useRef<HTMLElement>(null)
  const [selectedLanguage, setSelectedLanguage] = useState(TRAILER_LANGUAGE_OPTIONS[0])
  const [isLoading, setIsLoading] = useState(true)
  const { registerPlayer, unregisterPlayer, pauseOtherPlayers } = usePlayer()
  const PLAYER_ID = "trailer"

  useEffect(() => {
    // Verificar se estamos no cliente
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    // Check if Mux Player script is already loaded
    if (document.querySelector('script[src="https://unpkg.com/@mux/mux-player"]')) {
      setIsLoading(false)
      return
    }

    const script = document.createElement("script")
    script.src = "https://unpkg.com/@mux/mux-player"
    script.async = true
    document.head.appendChild(script)

    script.onload = () => {
      setIsLoading(false)
    }

    script.onerror = () => {
      setIsLoading(false)
    }

    return () => {
      // Limpar script se necessário
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Register player and handle events
  useEffect(() => {
    if (playerRef.current) {
      registerPlayer(PLAYER_ID, playerRef)

      const player = playerRef.current as any

      const handlePlay = () => {
        pauseOtherPlayers(PLAYER_ID)
      }

      const handlePause = () => {}

      // Removed anti-screenshot protection code

      player.addEventListener("play", handlePlay)
      player.addEventListener("pause", handlePause)

      // Removed debug control hiding code

      return () => {
        unregisterPlayer(PLAYER_ID)
        player.removeEventListener("play", handlePlay)
        player.removeEventListener("pause", handlePause)
      }
    }
  }, [registerPlayer, unregisterPlayer, pauseOtherPlayers])

  const handleLanguageChange = useCallback((language: (typeof TRAILER_LANGUAGE_OPTIONS)[0]) => {
    setSelectedLanguage(language)

    const player = playerRef.current as any
    if (player) {
      player.setAttribute("playback-id", language.playbackId)
    }
  }, [])

  const handleLanguageButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const handleLanguageItemClick = useCallback(
    (language: (typeof TRAILER_LANGUAGE_OPTIONS)[0], e: React.MouseEvent) => {
      e.stopPropagation()
      handleLanguageChange(language)
    },
    [handleLanguageChange],
  )

  return (
    <section id="trailer" className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-primary">Trailer</h2>
          <div className="w-24 h-1 bg-primary mx-auto" />
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 md:p-8">
            <div className="aspect-video rounded-lg overflow-hidden bg-black relative">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <mux-player
                    ref={playerRef}
                    playback-id={selectedLanguage.playbackId}
                    metadata-video-title="Prato Frio - Trailer"
                    metadata-viewer-user-id="anonymous"
                    stream-type="on-demand"
                    prefer-mse={true}
                    disable-cookies={false}
                    crossorigin="anonymous"
                    preload="metadata"
                    controls={true}
                    playsinline={true}
                    default-show-remaining-time={false}
                    no-hotkeys={false}
                    default-hidden-captions={false}
                    disable-picture-in-picture={false}
                    forward-seek-offset={10}
                    backward-seek-offset={10}
                    loading-show-play-button={true}
                    accent-color="#d4312c"
                    style={{
                      width: "100%",
                      height: "100%",
                      aspectRatio: "16/9",
                      borderRadius: "8px",
                      overflow: "hidden",
                      boxShadow: "0 8px 32px rgba(229, 9, 20, 0.2)",
                    }}
                  />

                  {/* Organized Player Controls */}
                  {/* Removed PlayerControls - using native Mux controls */}

                  <div className="absolute top-4 right-4 space-y-2">
                    <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center space-x-2">
                      <span className="text-lg">{selectedLanguage.flag}</span>
                      <span className="text-sm font-medium text-white">{selectedLanguage.code}</span>
                    </div>
                  </div>

                  <div className="absolute top-4 left-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-black/70 backdrop-blur-sm hover:bg-black/80 text-white"
                          onClick={handleLanguageButtonClick}
                        >
                          <Languages className="h-5 w-5 mr-2" />
                          Idioma
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="bg-black/95 backdrop-blur-sm border-white/20 z-10"
                        sideOffset={5}
                      >
                        {TRAILER_LANGUAGE_OPTIONS.map((language) => (
                          <DropdownMenuItem
                            key={language.code}
                            onClick={(e) => handleLanguageItemClick(language, e)}
                            className={`flex items-center space-x-3 hover:bg-white/10 cursor-pointer ${
                              selectedLanguage.code === language.code ? "bg-primary/20" : ""
                            }`}
                          >
                            <span className="text-lg">{language.flag}</span>
                            <span className="text-white">{language.name}</span>
                            {selectedLanguage.code === language.code && (
                              <div className="w-2 h-2 bg-primary rounded-full ml-auto" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">Assista ao trailer oficial de "Prato Frio"</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
