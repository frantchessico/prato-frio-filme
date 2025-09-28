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
                Em uma cidade onde os segredos são moeda corrente, um chef renomado descobre que sua vida perfeita foi
                construída sobre mentiras. Quando o passado volta para assombrá-lo, ele deve escolher entre a verdade
                que pode destruí-lo ou a vingança que pode salvá-lo.
              </p>

              <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Prato Frio</strong> é um thriller psicológico que explora os limites
                da moralidade humana, onde cada decisão tem consequências irreversíveis e a linha entre herói e vilão se
                torna cada vez mais tênue.
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
