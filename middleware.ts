import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Verificar bloqueio geográfico - apenas Moçambique (MZ) permitido
  // Ignorar verificação para a rota de bloqueio e assets estáticos
  if (!pathname.startsWith('/blocked') && 
      !pathname.startsWith('/_next') && 
      !pathname.startsWith('/api') &&
      pathname !== '/favicon.ico' &&
      !pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|eot)$/)) {
    
    // Em desenvolvimento, você pode desabilitar o bloqueio definindo DISABLE_GEO_BLOCK=true
    // Em produção, o bloqueio sempre será aplicado
    const isDevelopment = process.env.NODE_ENV === 'development'
    const disableGeoBlock = process.env.DISABLE_GEO_BLOCK === 'true'
    
    // Só não aplicar bloqueio se estiver em desenvolvimento E disableGeoBlock for true
    // Caso contrário, aplicar bloqueio geográfico
    if (!(isDevelopment && disableGeoBlock)) {
      // Obter país do usuário através de headers
      // Vercel fornece: x-vercel-ip-country
      // Cloudflare fornece: cf-ipcountry
      // Outros provedores podem usar: x-country-code, cloudfront-viewer-country
      const countryCode = 
        request.headers.get('x-vercel-ip-country')?.toUpperCase() || 
        request.headers.get('cf-ipcountry')?.toUpperCase() ||
        request.headers.get('x-country-code')?.toUpperCase() ||
        request.headers.get('cloudfront-viewer-country')?.toUpperCase() ||
        (request as any).geo?.country?.toUpperCase() ||
        null
      
      // Moçambique = MZ
      // Bloquear todos os países que não são Moçambique
      if (countryCode && countryCode !== 'MZ') {
        // Redirecionar para página de bloqueio
        return NextResponse.redirect(new URL('/blocked', request.url))
      }
      
      // Se não conseguirmos detectar o país, também bloqueamos por segurança
      // Isso garante que apenas conexões com país detectado como MZ terão acesso
      if (!countryCode) {
        // Bloquear se não conseguir detectar o país
        return NextResponse.redirect(new URL('/blocked', request.url))
      }
    }
  }
  
  // Verificar se o usuário está tentando acessar páginas protegidas
  if (pathname.startsWith('/donate') || pathname.startsWith('/api/user/')) {
    const token = request.cookies.get('auth_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      // Redirecionar para auth se não houver token
      return NextResponse.redirect(new URL('/auth', request.url))
    }
    
    try {
      // Verificar se o token é válido
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      
      if (payload.exp && payload.exp <= currentTime) {
        // Token expirado, redirecionar para auth
        return NextResponse.redirect(new URL('/auth', request.url))
      }
    } catch (error) {
      // Token inválido, redirecionar para auth
      return NextResponse.redirect(new URL('/auth', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
