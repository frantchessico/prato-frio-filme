"use client"

import React, { useState, useRef, useEffect, useCallback, memo, Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Languages, Settings } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePlayer } from "@/contexts/player-context"
import { useAuth } from "@/contexts/auth-context"
import { AuthModal } from "@/components/auth-modal"
import { DonationModal } from "@/components/donation-modal"
import { TimeIndicator } from "@/components/time-indicator"
import { LoadingSpinner } from "./loading-spinner"
import { useOptimizedDebounce, useOptimizedThrottle } from "@/hooks/use-optimized-performance"

const LANGUAGE_OPTIONS = [
  {
    code: "pt-MZ",
    name: "Português (Moçambique)",
    playbackId: "YOUR_PLAYBACK_ID_HERE",
  },
  {
    code: "en-US",
    name: "English (US)",
    playbackId: "YOUR_PLAYBACK_ID_HERE",
  },
]

const QUALITY_OPTIONS = [
  { value: "auto", label: "Automático" },
  { value: "1080p", label: "1080p" },
  { value: "720p", label: "720p" },
  { value: "480p", label: "480p" },
]

// Componente memoizado para controles
const VideoControls = memo(({ 
  selectedLanguage, 
  selectedQuality, 
  onLanguageChange, 
  onQualityChange 
}: {
  selectedLanguage: any
  selectedQuality: string
  onLanguageChange: (lang: any) => void
  onQualityChange: (quality: string) => void
}) => (
  <div className="absolute top-4 left-4 z-20 flex gap-2">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="bg-black/40 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
          <Languages className="h-4 w-4 mr-2" />
          {selectedLanguage.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black/90 backdrop-blur-sm border-white/20">
        {LANGUAGE_OPTIONS.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onLanguageChange(lang)}
            className="text-white hover:bg-white/10 focus:bg-white/10"
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="bg-black/40 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
          <Settings className="h-4 w-4 mr-2" />
          {selectedQuality}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32 bg-black/90 backdrop-blur-sm border-white/20">
        {QUALITY_OPTIONS.map((quality) => (
          <DropdownMenuItem
            key={quality.value}
            onClick={() => onQualityChange(quality.value)}
            className="text-white hover:bg-white/10 focus:bg-white/10"
          >
            {quality.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
))

VideoControls.displayName = 'VideoControls'

// Componente memoizado para o player
const OptimizedVideoPlayer = memo(({ 
  selectedLanguage, 
  playerRef, 
  isLoading, 
  useFallbackPlayer, 
  videoRef 
}: {
  selectedLanguage: any
  playerRef: React.RefObject<any>
  isLoading: boolean
  useFallbackPlayer: boolean
  videoRef: React.RefObject<HTMLVideoElement>
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-black rounded-2xl h-full">
        <LoadingSpinner size="lg" ariaLabel="Carregando player de vídeo" />
      </div>
    )
  }

  if (useFallbackPlayer) {
    return (
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-2xl"
        controls
        playsInline
        preload="metadata"
        style={{ aspectRatio: "16/9" }}
      >
        <source src={selectedLanguage.playbackId} type="video/mp4" />
        Seu navegador não suporta o elemento de vídeo.
      </video>
    )
  }

  return (
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
      primary-color="#d4312c"
      secondary-color="#d4312c"
    />
  )
})

OptimizedVideoPlayer.displayName = 'OptimizedVideoPlayer'

export function OptimizedWatchSection() {
  const { isAuthenticated, hasDonated, donationStatusChecked, checkingDonation } = useAuth()
  
  // Estados otimizados
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGE_OPTIONS[0])
  const [selectedQuality, setSelectedQuality] = useState("auto")
  const [isLoading, setIsLoading] = useState(true)
  const [useFallbackPlayer, setUseFallbackPlayer] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [hasReachedLimit, setHasReachedLimit] = useState(false)
  
  const playerRef = useRef<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const TIME_LIMIT = 12 * 60 // 12 minutos em segundos

  // Funções otimizadas com debounce/throttle
  const debouncedTimeUpdate = useOptimizedDebounce((time: number) => {
    setCurrentTime(time)
  }, 100)

  const throttledLanguageChange = useOptimizedThrottle((lang: any) => {
    setSelectedLanguage(lang)
  }, 300)

  const throttledQualityChange = useOptimizedThrottle((quality: string) => {
    setSelectedQuality(quality)
  }, 300)

  // Carregamento otimizado do Mux Player
  useEffect(() => {
    const loadMuxPlayer = async () => {
      if (document.querySelector('script[src*="@mux/mux-player"]')) {
        setIsLoading(false)
        return
      }

      try {
        const script = document.createElement("script")
        script.src = "https://unpkg.com/@mux/mux-player@2.9.0"
        script.async = true
        script.type = "module"

        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve()
          script.onerror = () => reject(new Error("Failed to load Mux Player"))
          document.head.appendChild(script)
        })

        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (customElements.get('mux-player')) {
          setIsLoading(false)
        } else {
          throw new Error("Mux Player custom element not registered")
        }
      } catch (error) {
        console.error("Error loading Mux Player:", error)
        setUseFallbackPlayer(true)
        setIsLoading(false)
      }
    }

    loadMuxPlayer()
  }, [])

  // Controle de tempo otimizado
  useEffect(() => {
    if (isLoading) return

    const checkTime = () => {
      const player = useFallbackPlayer ? videoRef.current : playerRef.current
      if (player) {
        const videoPlayer = player as any
        const time = videoPlayer.currentTime || 0
        debouncedTimeUpdate(time)
        
        if (time >= TIME_LIMIT && !hasReachedLimit) {
          setHasReachedLimit(true)
          
          if (!isAuthenticated) {
            videoPlayer.pause()
            setShowAuthModal(true)
          } else if (isAuthenticated && donationStatusChecked && !hasDonated) {
            videoPlayer.pause()
            setShowDonationModal(true)
          }
        }
      }
    }

    const interval = setInterval(checkTime, 1000)
    return () => clearInterval(interval)
  }, [isLoading, hasReachedLimit, isAuthenticated, hasDonated, donationStatusChecked, TIME_LIMIT, debouncedTimeUpdate])

  // Callbacks otimizados
  const handleLanguageChange = useCallback((lang: any) => {
    throttledLanguageChange(lang)
  }, [throttledLanguageChange])

  const handleQualityChange = useCallback((quality: string) => {
    throttledQualityChange(quality)
  }, [throttledQualityChange])

  const handleAuthSuccess = useCallback(() => {
    setShowAuthModal(false)
    setHasReachedLimit(false)
  }, [])

  const handleAuthClose = useCallback(() => {
    setShowAuthModal(false)
  }, [])

  const handleDonationSuccess = useCallback(() => {
    setShowDonationModal(false)
    setHasReachedLimit(false)
  }, [])

  const handleDonationClose = useCallback(() => {
    setShowDonationModal(false)
  }, [])

  return (
    <section 
      id="assistir" 
      className={`py-16 sm:py-20 px-4 bg-background transition-all duration-300 ${showAuthModal || showDonationModal ? 'blur-sm' : ''}`}
      aria-labelledby="assistir-title"
    >
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
            className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 shadow-2xl"
            role="region"
            aria-label="Player de vídeo principal"
          >
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <OptimizedVideoPlayer
                selectedLanguage={selectedLanguage}
                playerRef={playerRef}
                isLoading={isLoading}
                useFallbackPlayer={useFallbackPlayer}
                videoRef={videoRef}
              />
            </Suspense>

            <VideoControls
              selectedLanguage={selectedLanguage}
              selectedQuality={selectedQuality}
              onLanguageChange={handleLanguageChange}
              onQualityChange={handleQualityChange}
            />

            <TimeIndicator
              currentTime={currentTime}
              timeLimit={TIME_LIMIT}
              isAuthenticated={isAuthenticated}
              hasDonated={hasDonated}
              donationStatusChecked={donationStatusChecked}
            />

            {/* Overlay de bloqueio otimizado */}
            {hasReachedLimit && (
              (!isAuthenticated || 
              (isAuthenticated && donationStatusChecked && !hasDonated))
            ) && (
              <div 
                className="absolute inset-0 bg-black/90 backdrop-blur-sm z-30 flex items-center justify-center"
                role="dialog"
                aria-modal="true"
                aria-labelledby="blocked-title"
                aria-describedby="blocked-description"
              >
                <div className="text-center text-white p-6 sm:p-8 max-w-md mx-4">
                  <div className="mb-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 id="blocked-title" className="text-xl sm:text-2xl font-bold mb-2">Acesso Restrito</h3>
                    <p id="blocked-description" className="text-gray-300 mb-6 text-sm sm:text-base">
                      {!isAuthenticated 
                        ? "Para continuar assistindo, você precisa se autenticar e fazer uma doação"
                        : "Para continuar assistindo, você precisa fazer uma doação para apoiar o projeto"
                      }
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    {!isAuthenticated ? (
                      <>
                        <Button 
                          onClick={() => setShowAuthModal(true)}
                          className="bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
                          aria-label="Apoiar o projeto agora"
                        >
                          Apoiar Agora
                        </Button>
                        <Button 
                          onClick={() => setShowAuthModal(true)}
                          variant="outline"
                          className="border-white text-white hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                          aria-label="Já sou apoiador"
                        >
                          Já Apoiei
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={() => setShowDonationModal(true)}
                        className="bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
                        aria-label="Fazer doação para continuar assistindo"
                      >
                        Fazer Doação
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modais */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={handleAuthClose}
          onSuccess={handleAuthSuccess}
        />

        <DonationModal
          isOpen={showDonationModal}
          onClose={handleDonationClose}
          onSuccess={handleDonationSuccess}
        />
      </div>
    </section>
  )
}
