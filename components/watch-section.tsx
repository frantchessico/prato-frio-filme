"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback, memo } from "react"
import { Button } from "@/components/ui/button"
import { Languages, Settings } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePlayer } from "@/contexts/player-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { TimeIndicator } from "@/components/time-indicator"
import { logger } from "@/lib/logger"
import { usePerformanceOptimized } from "@/hooks/use-performance-optimized"

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

export const WatchSection = memo(function WatchSection() {
  const router = useRouter()
  const { isAuthenticated, hasDonated, checkDonationStatus, checkingDonation, donationStatusChecked } = useAuth()
  const { isHydrated, useDebounce, useThrottle } = usePerformanceOptimized()
  
  logger.log("🔍 WatchSection - isAuthenticated:", isAuthenticated, "hasDonated:", hasDonated)

  const playerRef = useRef<HTMLElement | HTMLVideoElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGE_OPTIONS[0])
  const [selectedQuality, setSelectedQuality] = useState(QUALITY_OPTIONS[0])
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [hasReachedLimit, setHasReachedLimit] = useState(false)
  const [useFallbackPlayer, setUseFallbackPlayer] = useState(false)
  const TIME_LIMIT = 1 * 60 // 1 minuto para usuários não autenticados

  useEffect(() => {
    if (isAuthenticated && !checkingDonation) {
      checkDonationStatus()

      // Verificar status apenas quando necessário, não a cada 30 segundos
      const interval = setInterval(() => {
        // Só verificar se o usuário não doou ainda
        if (!hasDonated) {
          checkDonationStatus()
        }
      }, 60000) // Reduzido para 1 minuto

      return () => clearInterval(interval)
    }
  }, [isAuthenticated, checkDonationStatus, checkingDonation, hasDonated])

  useEffect(() => {
    if (hasReachedLimit) {
      if (!isAuthenticated) {
        const player = useFallbackPlayer ? videoRef.current : playerRef.current
        if (player) {
          const videoPlayer = player as any
          videoPlayer.pause()
        }
        // Redirecionamento automático para usuário não autenticado
        logger.log("🔴 Redirecionamento automático para auth...")
        router.push("/auth?redirect=/#assistir")
      } else if (isAuthenticated && donationStatusChecked && !hasDonated) {
        const player = useFallbackPlayer ? videoRef.current : playerRef.current
        if (player) {
          const videoPlayer = player as any
          videoPlayer.pause()
        }
        // Redirecionamento automático para usuário autenticado sem doação
        logger.log("🔴 Redirecionamento automático para donate...")
        router.push("/donate?redirect=/#assistir")
      }
    }
  }, [hasReachedLimit, isAuthenticated, hasDonated, donationStatusChecked, useFallbackPlayer, router])

  // Verificar se usuário autenticado sem doação deve ser redirecionado imediatamente
  useEffect(() => {
    if (isAuthenticated && donationStatusChecked && !hasDonated) {
      logger.log("🔴 Usuário autenticado sem doação - redirecionando para donate...")
      router.push("/donate?redirect=/#assistir")
    }
  }, [isAuthenticated, donationStatusChecked, hasDonated, router])

  const [error, setError] = useState<string | null>(null)

  const { registerPlayer, unregisterPlayer, pauseOtherPlayers } = usePlayer()
  const PLAYER_ID = "main-movie"

  useEffect(() => {
    if (document.querySelector('script[src*="@mux/mux-player"]')) {
      setIsLoading(false)
      return
    }

    const loadMuxPlayer = async () => {
      try {
        // Usar intersection observer para carregar apenas quando necessário
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadPlayerScript()
              observer.disconnect()
            }
          })
        })

        const loadPlayerScript = async () => {
          try {
            const script = document.createElement("script")
            script.src = "https://unpkg.com/@mux/mux-player@2.9.0"
            script.async = true
            script.type = "module"
            script.crossOrigin = "anonymous"

            const loadPromise = new Promise<void>((resolve, reject) => {
              script.onload = () => {
                resolve()
              }
              script.onerror = () => {
                reject(new Error("Failed to load Mux Player"))
              }
            })

            document.head.appendChild(script)
            await loadPromise

            await new Promise((resolve) => setTimeout(resolve, 100))

            if (customElements.get("mux-player")) {
              setIsLoading(false)
            } else {
              throw new Error("Mux Player custom element not registered")
            }
          } catch (error) {
            console.warn("Mux Player failed to load, using fallback:", error)
            setUseFallbackPlayer(true)
            setIsLoading(false)
          }
        }

        // Observar o container do player
        const playerContainer = document.getElementById('player-container')
        if (playerContainer) {
          observer.observe(playerContainer)
        } else {
          // Fallback se não encontrar o container
          loadPlayerScript()
        }
      } catch (error) {
        console.warn("Failed to setup player observer:", error)
        setUseFallbackPlayer(true)
        setIsLoading(false)
      }
    }

    loadMuxPlayer()
  }, [])

  useEffect(() => {
    if (isLoading) return

    let intervalId: NodeJS.Timeout | null = null
    let timeUpdateListener: (() => void) | null = null
    let setupTimer: NodeJS.Timeout | null = null

    const checkTime = () => {
      const player = useFallbackPlayer ? videoRef.current : playerRef.current
      if (player) {
        const videoPlayer = player as any
        const time = videoPlayer.currentTime || 0
        setCurrentTime(time)

        if (time >= TIME_LIMIT && !hasReachedLimit) {
          setHasReachedLimit(true)

          if (!isAuthenticated) {
            videoPlayer.pause()
          } else if (isAuthenticated && donationStatusChecked && !hasDonated) {
            videoPlayer.pause()
          }
        }

        if (hasReachedLimit) {
          if (!isAuthenticated && !videoPlayer.paused) {
            videoPlayer.pause()
          } else if (isAuthenticated && donationStatusChecked && !hasDonated && !videoPlayer.paused) {
            videoPlayer.pause()
          }
        }
      }
    }

    const setupTimeTracking = () => {
      const player = useFallbackPlayer ? videoRef.current : playerRef.current
      if (player) {
        const videoPlayer = player as any

        timeUpdateListener = checkTime
        videoPlayer.addEventListener("timeupdate", timeUpdateListener)

        intervalId = setInterval(checkTime, 1000)
      }
    }

    setupTimer = setTimeout(setupTimeTracking, 2000)

    return () => {
      // Limpar todos os timers e listeners
      if (setupTimer) clearTimeout(setupTimer)
      if (intervalId) clearInterval(intervalId)

      const player = useFallbackPlayer ? videoRef.current : playerRef.current
      if (player && timeUpdateListener) {
        const videoPlayer = player as any
        videoPlayer.removeEventListener("timeupdate", timeUpdateListener)
      }
    }
  }, [useFallbackPlayer, isAuthenticated, hasDonated, donationStatusChecked, isLoading, TIME_LIMIT, hasReachedLimit])

  // Funções de redirecionamento removidas - agora é automático

  const handlePlayAttempt = useCallback(() => {
    if (hasReachedLimit) {
      if (!isAuthenticated) {
        const player = useFallbackPlayer ? videoRef.current : playerRef.current
        if (player) {
          const videoPlayer = player as any
          videoPlayer.pause()
        }
        return false
      } else if (isAuthenticated && donationStatusChecked && !hasDonated) {
        const player = useFallbackPlayer ? videoRef.current : playerRef.current
        if (player) {
          const videoPlayer = player as any
          videoPlayer.pause()
        }
        return false
      }
    }
    return true
  }, [hasReachedLimit, isAuthenticated, hasDonated, donationStatusChecked, useFallbackPlayer])

  useEffect(() => {
    const currentPlayerRef = useFallbackPlayer ? videoRef : playerRef
    if (currentPlayerRef.current && !isLoading) {
      registerPlayer(PLAYER_ID, currentPlayerRef)

      const player = currentPlayerRef.current as any

      const handlePlay = () => {
        if (hasReachedLimit) {
          if (!isAuthenticated) {
            player.pause()
            return
          } else if (isAuthenticated && donationStatusChecked && !hasDonated) {
            player.pause()
            return
          }
        }

        setError(null)
        pauseOtherPlayers(PLAYER_ID)
      }

      const handleError = (e: any) => {
        setError("Erro ao carregar o vídeo. Tente novamente.")
      }

      player.addEventListener("play", handlePlay)
      player.addEventListener("error", handleError)

      return () => {
        unregisterPlayer(PLAYER_ID)
        player.removeEventListener("play", handlePlay)
        player.removeEventListener("error", handleError)
      }
    }
  }, [isLoading, useFallbackPlayer])

  const handleLanguageChange = useCallback((language: (typeof LANGUAGE_OPTIONS)[0]) => {
    setSelectedLanguage(language)
    const player = playerRef.current as any
    if (player) {
      player.setAttribute("playback-id", language.playbackId)
    }
  }, [])

  const handleQualityChange = useCallback((quality: (typeof QUALITY_OPTIONS)[0]) => {
    setSelectedQuality(quality)
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

  return (
    <section id="assistir" className="py-16 sm:py-20 px-4 bg-background" aria-labelledby="assistir-title">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8 sm:mb-12">
          <h2
            id="assistir-title"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 text-balance text-primary"
          >
            Assistir Agora
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-primary mx-auto rounded-full" aria-hidden="true" />
        </div>

        <div className="relative">
          <div
            id="player-container"
            className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 shadow-2xl"
            role="region"
            aria-label="Player de vídeo principal"
          >
            {/* TimeIndicator para mostrar tempo restante */}
            <TimeIndicator
              currentTime={currentTime}
              timeLimit={TIME_LIMIT}
              isAuthenticated={isAuthenticated}
              hasDonated={hasDonated}
              donationStatusChecked={donationStatusChecked}
            />

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
                >
                  <source
                    src={`https://stream.mux.com/${selectedLanguage.playbackId}.m3u8`}
                    type="application/x-mpegURL"
                  />
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
                  preload="none"
                  controls={true}
                  playsinline={true}
                  default-show-remaining-time={false}
                  no-hotkeys={false}
                  default-hidden-captions={false}
                  disable-picture-in-picture={false}
                  forward-seek-offset={10}
                  backward-seek-offset={10}
                  loading-show-play-button={true}
                  muted={false}
                  autoplay={false}
                  loop={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    aspectRatio: "16/9",
                  }}
                  accent-color="#d4312c"
                />

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

          <div className="mt-12">
            <div className="bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm rounded-2xl p-8 border border-border/50">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                <div className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-4xl lg:text-5xl font-serif font-bold text-balance text-primary leading-tight">
                      Prato Frio
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-lg text-muted-foreground">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">2025</span>
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
                    Quando o passado volta à mesa. Um thriller psicológico que explora os limites da justiça e da
                    moralidade, mergulhando nas profundezas da alma humana.
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
                    className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm bg-transparent"
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
    </section>
  )
})
