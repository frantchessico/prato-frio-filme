"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Languages, Settings } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePlayer } from "@/contexts/player-context"
import { useAuth } from "@/contexts/auth-context"
import { AuthModal } from "@/components/auth-modal"
import { TimeIndicator } from "@/components/time-indicator"


const LANGUAGE_OPTIONS = [
  {
    code: "pt-MZ",
    name: "Português (Moçambique)",
    flag: "🇲🇿",
    playbackId: "kJZWjPKC5woaOlkT1yoo01V9IXIZtkrfKySuVPAiD8Kg",
  },
  {
    code: "pt-BR",
    name: "Português (Brasil)",
    flag: "🇧🇷",
    playbackId: "kJZWjPKC5woaOlkT1yoo01V9IXIZtkrfKySuVPAiD8Kg",
  },
  {
    code: "en-US",
    name: "English (US)",
    flag: "🇺🇸",
    playbackId: "kJZWjPKC5woaOlkT1yoo01V9IXIZtkrfKySuVPAiD8Kg",
  },
]

const QUALITY_OPTIONS = [
  { label: "Auto", value: "auto" },
  { label: "1080p", value: "1080p" },
  { label: "720p", value: "720p" },
  { label: "480p", value: "480p" },
  { label: "360p", value: "360p" },
]

export function WatchSection() {
  const { isAuthenticated, user } = useAuth()
  const playerRef = useRef<HTMLElement | HTMLVideoElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGE_OPTIONS[0])
  const [selectedQuality, setSelectedQuality] = useState(QUALITY_OPTIONS[0])
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [hasReachedLimit, setHasReachedLimit] = useState(false)
  const TIME_LIMIT = 1 * 60 // 12 minutos em segundos
  
  // Função para testar o limite (apenas para desenvolvimento)
  const testTimeLimit = () => {
    console.log('[AUTH] Testing time limit - forcing modal')
    setHasReachedLimit(true)
    setShowAuthModal(true)
    const player = useFallbackPlayer ? videoRef.current : playerRef.current
    if (player) {
      const videoPlayer = player as any
      videoPlayer.pause()
    }
  }
  const [error, setError] = useState<string | null>(null)
  const [useFallbackPlayer, setUseFallbackPlayer] = useState(false)

  const { registerPlayer, unregisterPlayer, pauseOtherPlayers } = usePlayer()
  const PLAYER_ID = "main-movie"

  useEffect(() => {
    // Check if Mux Player script is already loaded
    if (document.querySelector('script[src*="@mux/mux-player"]')) {
      setIsLoading(false)
      return
    }

    const loadMuxPlayer = async () => {
      try {
        // Try to load the Mux Player script
    const script = document.createElement("script")
    script.src = "https://unpkg.com/@mux/mux-player@2.9.0"
    script.async = true
    script.type = "module"

        const loadPromise = new Promise<void>((resolve, reject) => {
    script.onload = () => {
      console.log("[v0] Mux Player loaded successfully")
            resolve()
    }
    script.onerror = () => {
      console.error("[v0] Failed to load Mux Player")
            reject(new Error("Failed to load Mux Player"))
          }
        })

        document.head.appendChild(script)
        await loadPromise
        
        // Wait a bit more to ensure the custom element is registered
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Check if mux-player element is available
        if (customElements.get('mux-player')) {
      setIsLoading(false)
        } else {
          throw new Error("Mux Player custom element not registered")
        }
      } catch (error) {
        console.error("[v0] Error loading Mux Player:", error)
        console.log("[v0] Falling back to HTML5 video player")
        setUseFallbackPlayer(true)
        setIsLoading(false)
      }
    }

    loadMuxPlayer()
  }, [])

  // Controle de tempo para restrição de 12 minutos
  useEffect(() => {
    if (isLoading) return

    let intervalId: NodeJS.Timeout
    let timeUpdateListener: (() => void) | null = null

    const checkTime = () => {
      const player = useFallbackPlayer ? videoRef.current : playerRef.current
      if (player) {
        const videoPlayer = player as any
        const time = videoPlayer.currentTime || 0
        console.log(`[AUTH] Current time: ${time}s, Limit: ${TIME_LIMIT}s, Authenticated: ${isAuthenticated}`)
        setCurrentTime(time)
        
        // Verificar se atingiu o limite de 12 minutos
        if (time >= TIME_LIMIT && !isAuthenticated && !hasReachedLimit) {
          console.log('[AUTH] Time limit reached! Pausing video and showing modal')
          setHasReachedLimit(true)
          videoPlayer.pause()
          setShowAuthModal(true)
        }
      }
    }

    const setupTimeTracking = () => {
      const player = useFallbackPlayer ? videoRef.current : playerRef.current
      if (player) {
        const videoPlayer = player as any
        console.log('[AUTH] Setting up time tracking')
        
        // Adicionar listener de timeupdate
        timeUpdateListener = checkTime
        videoPlayer.addEventListener('timeupdate', timeUpdateListener)
        
        // Também usar intervalo como backup
        intervalId = setInterval(checkTime, 1000)
        
        console.log('[AUTH] Time tracking setup complete')
      }
    }

    // Aguardar um pouco para o player estar pronto
    const timer = setTimeout(setupTimeTracking, 2000)

    return () => {
      clearTimeout(timer)
      if (intervalId) clearInterval(intervalId)
      
      const player = useFallbackPlayer ? videoRef.current : playerRef.current
      if (player && timeUpdateListener) {
        const videoPlayer = player as any
        videoPlayer.removeEventListener('timeupdate', timeUpdateListener)
      }
    }
  }, [useFallbackPlayer, isAuthenticated, hasReachedLimit, TIME_LIMIT, isLoading])

  // Funções para o modal de autenticação
  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    setHasReachedLimit(false)
    // Permitir que o usuário continue assistindo
    const player = useFallbackPlayer ? videoRef.current : playerRef.current
    if (player) {
      const videoPlayer = player as any
      videoPlayer.play()
    }
  }

  const handleAuthClose = () => {
    setShowAuthModal(false)
    // Se não autenticado, pausar o vídeo
    if (!isAuthenticated) {
      const player = useFallbackPlayer ? videoRef.current : playerRef.current
      if (player) {
        const videoPlayer = player as any
        videoPlayer.pause()
      }
    }
  }

  // Bloquear reprodução se atingiu o limite e não está autenticado
  const handlePlayAttempt = useCallback(() => {
    if (hasReachedLimit && !isAuthenticated) {
      console.log('[AUTH] Play blocked - user must authenticate')
      const player = useFallbackPlayer ? videoRef.current : playerRef.current
      if (player) {
        const videoPlayer = player as any
        videoPlayer.pause()
        setShowAuthModal(true)
      }
      return false
    }
    return true
  }, [hasReachedLimit, isAuthenticated, useFallbackPlayer])

  useEffect(() => {
    const currentPlayerRef = useFallbackPlayer ? videoRef : playerRef
    if (currentPlayerRef.current && !isLoading) {
      registerPlayer(PLAYER_ID, currentPlayerRef)

      const player = currentPlayerRef.current as any

      const handlePlay = () => {
        // Verificar se pode reproduzir
        if (hasReachedLimit && !isAuthenticated) {
          console.log("[AUTH] Play blocked - user must authenticate")
          player.pause()
          setShowAuthModal(true)
          return
        }
        
        console.log("[v0] Player started playing")
        setError(null)
        pauseOtherPlayers(PLAYER_ID)
      }

      const handleError = (e: any) => {
        console.error("[v0] Player error:", e)
        setError("Erro ao carregar o vídeo. Tente novamente.")
      }

      // Add essential event listeners only
      player.addEventListener("play", handlePlay)
      player.addEventListener("error", handleError)

      return () => {
        unregisterPlayer(PLAYER_ID)
        player.removeEventListener("play", handlePlay)
        player.removeEventListener("error", handleError)
      }
    }
  }, [isLoading, useFallbackPlayer])

  // Removed custom player control functions - using Mux Player's native controls

  const handleLanguageChange = useCallback((language: (typeof LANGUAGE_OPTIONS)[0]) => {
    setSelectedLanguage(language)
    const player = playerRef.current as any
    if (player) {
      player.setAttribute("playback-id", language.playbackId)
      console.log(`[v0] Language changed to ${language.name}`)
    }
  }, [])

  const handleQualityChange = useCallback((quality: (typeof QUALITY_OPTIONS)[0]) => {
    setSelectedQuality(quality)
    console.log(`[v0] Quality changed to ${quality.label}`)
  }, [])

  const handleLanguageButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const handleLanguageItemClick = useCallback(
    (language: (typeof LANGUAGE_OPTIONS)[0], e: React.MouseEvent) => {
      e.stopPropagation()
      handleLanguageChange(language)
    },
    [handleLanguageChange],
  )

  // Removed custom keyboard shortcuts and auto-hide controls - using Mux Player's native controls

  return (
    <section id="assistir" className={`py-20 px-4 bg-background transition-all duration-300 ${showAuthModal ? 'blur-sm' : ''}`}>
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-4 text-balance text-primary">Assistir Agora</h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="relative">
          {/* Hero Video Player */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 shadow-2xl">
              {/* Indicador de tempo */}
              <TimeIndicator 
                currentTime={currentTime}
                timeLimit={TIME_LIMIT}
                isAuthenticated={isAuthenticated}
              />
              
              {/* Botão de teste temporário - remover em produção */}
              {!isAuthenticated && (
                <div className="absolute top-4 left-4 z-20">
                  <Button 
                    onClick={testTimeLimit}
                    size="sm"
                    variant="destructive"
                    className="text-xs"
                  >
                    Testar Modal
                  </Button>
                </div>
              )}

              {/* Overlay de bloqueio após limite de tempo */}
              {hasReachedLimit && !isAuthenticated && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-30 flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Acesso Restrito</h3>
                      <p className="text-gray-300 mb-6">
                        Para continuar assistindo, você precisa se autenticar
                      </p>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button 
                        onClick={() => setShowAuthModal(true)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Apoiar Agora
                      </Button>
                      <Button 
                        onClick={() => setShowAuthModal(true)}
                        variant="outline"
                        className="border-white text-white hover:bg-white hover:text-black"
                      >
                        Já Apoiei
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white/80 text-lg font-medium">Carregando Player...</p>
                </div>
                </div>
              ) : useFallbackPlayer ? (
                <>
                  <video
                    ref={videoRef}
                    controls
                    preload="metadata"
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      aspectRatio: "16/9",
                      borderRadius: "16px",
                      overflow: "hidden",
                    }}
                    onPlay={() => console.log("[v0] HTML5 Player play event")}
                    onPause={() => console.log("[v0] HTML5 Player pause event")}
                    onLoadedMetadata={() => console.log("[v0] HTML5 Player metadata loaded")}
                    onError={() => console.error("[v0] HTML5 Player error")}
                  >
                    <source src={`https://stream.mux.com/${selectedLanguage.playbackId}.m3u8`} type="application/x-mpegURL" />
                    <p>Seu navegador não suporta vídeo HTML5.</p>
                  </video>
                </>
              ) : (
                <>
                  <mux-player
                    ref={playerRef}
                    playback-id={selectedLanguage.playbackId}
                    metadata-video-title="Prato Frio"
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
                    style={{
                      width: "100%",
                      height: "100%",
                      aspectRatio: "16/9",
                      
                    }}
                    accent-color="#d4312c"
                    onPlay={() => console.log("[v0] Mux Player play event")}
                    onPause={() => console.log("[v0] Mux Player pause event")}
                    onLoadedMetadata={() => console.log("[v0] Mux Player metadata loaded")}
                    onError={() => console.error("[v0] Mux Player error")}
                  />

                {/* Language and Quality Controls */}
                <div className="absolute top-4 left-4 z-10">
                      <div className="flex items-center space-x-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                              className="bg-black/60 backdrop-blur-md hover:bg-black/80 text-white border border-white/20 hover:border-primary/50 transition-all duration-300 rounded-xl px-4 py-2"
                          onClick={handleLanguageButtonClick}
                        >
                              <Languages className="h-4 w-4 mr-2" />
                              <span className="font-medium">Idioma</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                            className="bg-black/95 backdrop-blur-xl border-white/20 rounded-xl shadow-2xl"
                            sideOffset={8}
                      >
                        {LANGUAGE_OPTIONS.map((language) => (
                          <DropdownMenuItem
                            key={language.code}
                            onClick={(e) => handleLanguageItemClick(language, e)}
                                className={`flex items-center space-x-3 hover:bg-white/10 cursor-pointer transition-all duration-200 rounded-lg ${
                              selectedLanguage.code === language.code ? "bg-primary/20" : ""
                            }`}
                          >
                            <span className="text-lg">{language.flag}</span>
                                <span className="text-white font-medium">{language.name}</span>
                            {selectedLanguage.code === language.code && (
                              <div className="w-2 h-2 bg-primary rounded-full ml-auto" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                              className="bg-black/60 backdrop-blur-md hover:bg-black/80 text-white border border-white/20 hover:border-primary/50 transition-all duration-300 rounded-xl px-4 py-2"
                        >
                              <Settings className="h-4 w-4 mr-2" />
                              <span className="font-medium">{selectedQuality.label}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                            className="bg-black/95 backdrop-blur-xl border-white/20 rounded-xl shadow-2xl"
                            sideOffset={8}
                      >
                        {QUALITY_OPTIONS.map((quality) => (
                          <DropdownMenuItem
                            key={quality.value}
                            onClick={() => handleQualityChange(quality)}
                                className={`flex items-center justify-between hover:bg-white/10 cursor-pointer transition-all duration-200 rounded-lg ${
                              selectedQuality.value === quality.value ? "bg-primary/20" : ""
                            }`}
                          >
                                <span className="text-white font-medium">{quality.label}</span>
                            {selectedQuality.value === quality.value && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                            </div>
                          </div>

                  {/* Error Message */}
                  {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-auto z-20">
                      <div className="text-center text-white p-6 max-w-md">
                        <div className="text-red-400 mb-4 text-6xl">⚠️</div>
                        <h3 className="text-xl font-bold mb-2">Erro no Player</h3>
                        <p className="text-gray-300 mb-4">{error}</p>
                        <Button
                          onClick={() => {
                            setError(null)
                            const player = playerRef.current as any
                            if (player) {
                              player.load()
                            }
                          }}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Tentar Novamente
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

          {/* Movie Information */}
          <div className="mt-12">
            <div className="bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm rounded-2xl p-8 border border-border/50">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                <div className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-4xl lg:text-5xl font-serif font-bold text-balance text-primary leading-tight">
                      Prato Frio
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-lg text-muted-foreground">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">2024</span>
                      <span className="bg-white/10 text-white px-3 py-1 rounded-full">Thriller</span>
                      <span className="bg-white/10 text-white px-3 py-1 rounded-full">2h 00min</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2 bg-black/20 rounded-lg px-3 py-2">
                      <span className="text-2xl">{selectedLanguage.flag}</span>
                      <span className="text-white font-medium">{selectedLanguage.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-black/20 rounded-lg px-3 py-2">
                      <Settings className="h-4 w-4 text-white" />
                      <span className="text-white font-medium">{selectedQuality.label}</span>
                    </div>
                  </div>

                      <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                    Quando a vingança é servida fria, o sabor é inesquecível. Um thriller psicológico que explora os
                        limites da justiça e da moralidade, mergulhando nas profundezas da alma humana.
                      </p>

                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <span className="mr-2">+</span>
                    Adicionar à Lista
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  >
                    <span className="mr-2">↗</span>
                    Compartilhar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Autenticação */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthClose}
        onSuccess={handleAuthSuccess}
      />
    </section>
  )
}
