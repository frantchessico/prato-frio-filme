"use client"

import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

export function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  const handleWatchNow = () => {
    scrollToSection("assistir")
  }

  const handleWatchTrailer = () => {
    scrollToSection("trailer")
  }

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-b from-black/20 via-black/60 to-black/90" />
        <img
          src="/dark-cinematic-movie-scene-with-dramatic-lighting.jpg"
          alt="Prato Frio Background"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="space-y-6 animate-fade-in">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold text-balance">
            <span className="text-white">PRATO</span>
            <br />
            <span style={{ color: "#D4312C" }}>FRIO</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto text-pretty">
            Quando a vingança é servida fria, o sabor é inesquecível
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button
              size="lg"
              className="text-lg px-8 py-6 text-white hover:opacity-90"
              style={{ backgroundColor: "#D4312C" }}
              onClick={handleWatchNow}
            >
              <Play className="mr-2 h-5 w-5" />
              Assistir Agora
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-black"
              onClick={handleWatchTrailer}
            >
              Ver Trailer
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  )
}
