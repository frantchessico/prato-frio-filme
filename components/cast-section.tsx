import { Card, CardContent } from "@/components/ui/card"

const castMembers = [
  {
    name: "Moya Langa",
    role: "Atriz",
    character: "Erica",
    image: "/elenco/1-Moya Langa.JPG",
  },
  {
    name: "Fernando Cuamba",
    role: "Ator",
    character: "Blazer",
    image: "/elenco/2-Fernado Cuamba.JPG",
  },
  {
    name: "Leia Nhambe",
    role: "Atriz",
    character: "Leda",
    image: "/elenco/3-Leia Nhambe.jpg",
  },
  {
    name: "Dário Karino",
    role: "Ator",
    character: "Valdo",
    image: "/elenco/4-Dário Karino.JPG",
  },
  {
    name: "Yatólia Machel",
    role: "Atriz",
    character: "Mona",
    image: "/elenco/5-Yatolia Machel.jpg",
  },
  {
    name: "Júlio Tómas Junior",
    role: "Ator",
    character: "Cuper",
    image: "/elenco/6-Julio Tomas Junior.jpg",
  },
  {
    name: "Tomás Bie",
    role: "Ator",
    character: "Eduardo Fumo",
    image: "/elenco/8-Tomás Bie.JPG",
  },
  {
    name: "Dalila Coana",
    role: "Atriz",
    character: "Sandra Fumo",
    image: "/elenco/9-Dalila Coana.JPG",
  },
]

export function CastSection() {
  return (
    <section id="elenco" className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-primary">Elenco</h2>
          <div className="w-24 h-1 bg-primary mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {castMembers.map((member, index) => (
            <Card
              key={index}
              className="group hover:scale-105 transition-transform duration-300 bg-card border-border shadow-lg hover:shadow-xl"
            >
              <CardContent className="p-0">
                <div className="aspect-[3/4] overflow-hidden rounded-t-lg relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 text-center bg-card">
                  <h3 className="text-xl font-semibold mb-2 text-primary">{member.name}</h3>
                  <p className="text-primary font-medium mb-1">{member.role}</p>
                  <p className="text-muted-foreground text-sm font-medium">como {member.character}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
