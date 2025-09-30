import { MovieHeader } from "@/components/movie-header"
import { HeroSection } from "@/components/hero-section"
import { SynopsisSection } from "@/components/synopsis-section"
import { CastSection } from "@/components/cast-section"
import { TrailerSection } from "@/components/trailer-section"
import { WatchSection } from "@/components/watch-section"
import { MovieFooter } from "@/components/movie-footer"


export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <MovieHeader />
      <main>
        
        <HeroSection />
        <SynopsisSection />
        <CastSection />
        <TrailerSection />
        <WatchSection />
      </main>
      <MovieFooter />
      
    </div>
  )
}
