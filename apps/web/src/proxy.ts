import { type NextRequest, NextResponse } from 'next/server';

// Pages d'authentification : un utilisateur déjà connecté en est renvoyé vers
// l'accueil.
const AUTH_PATHS = ['/login', '/register'];

// Pages accessibles sans être connecté (et sans redirection si on l'est).
// Le catalogue produits est public.
const OPEN_PATHS = ['/products'];

// Pages qui nécessitent uniquement d'être connecté (le check admin est fait
// dans le layout côté serveur).
const PROTECTED_PATHS = ['/admin'];

export function proxy(request: NextRequest) {
  // Server Actions are POST requests — never redirect them
  if (request.method !== 'GET') return NextResponse.next();

  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));
  const isOpen = OPEN_PATHS.some((p) => pathname.startsWith(p));
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  // Non connecté : seules les pages d'auth et publiques sont accessibles.
  if (!token && !isAuthPage && !isOpen) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // /admin sans token → login (redondant avec le cas précédent, mais explicite)
  if (isProtected && !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // Connecté : on ne reste pas sur les pages d'auth (mais on peut voir les
  // pages publiques comme le catalogue).
  if (token && isAuthPage) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/';
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
