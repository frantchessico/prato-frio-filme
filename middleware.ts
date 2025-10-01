import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
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
