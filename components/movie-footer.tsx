import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

export function MovieFooter() {
  return (
    <footer className="bg-background border-t border-border py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-serif font-bold text-primary mb-4">PRATO FRIO</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Um thriller cinematográfico que explora os limites da vingança e da redenção humana.
            </p>

            {/* Social Media */}
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <a href="#sinopse" className="text-muted-foreground hover:text-primary transition-colors">
                  Sinopse
                </a>
              </li>
              <li>
                <a href="#elenco" className="text-muted-foreground hover:text-primary transition-colors">
                  Elenco
                </a>
              </li>
              <li>
                <a href="#trailer" className="text-muted-foreground hover:text-primary transition-colors">
                  Trailer
                </a>
              </li>
              <li>
                <a href="#assistir" className="text-muted-foreground hover:text-primary transition-colors">
                  Assistir
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Contato</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Imprensa: imprensa@pratofrio.com</li>
              <li>Distribuição: dist@pratofrio.com</li>
              <li>Suporte: suporte@pratofrio.com</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2025 Prato Frio. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
