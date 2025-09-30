import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function SynopsisSection() {
  return (
    <section id="sinopse" className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-primary">Sinopse</h2>
          <div className="w-24 h-1 bg-primary mx-auto" />
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-8 md:p-12">
            <div className="space-y-6">
              <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
                Erica, uma jovem de 19 anos, vive uma vida aparentemente perfeita com seus pais ricos. Mas seu mundo 
                desmorona quando intrusos armados invadem sua casa e assassinam brutalmente sua família. Enquanto ela 
                sofre, a verdade vem à tona — "Vingança Congelada" se desenrola como um thriller psicológico envolvente 
                que explora trauma, traição e vingança, ambientado no Moçambique moderno.
              </p>

              <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Prato Frio</strong> é uma história poderosa de uma jovem que transforma 
                a dor em uma busca implacável por vingança, onde cada decisão tem consequências irreversíveis e a linha 
                entre vítima e vingadora se torna cada vez mais tênue.
              </p>

              <div className="pt-6">
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Ver mais detalhes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
