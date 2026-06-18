import { type NextRequest, NextResponse } from 'next/server';

// Pages d'authentification. La redirection d'un utilisateur déjà connecté est
// faite dans les pages via getCurrentUser(), pas ici, pour ne pas bloquer un
// utilisateur qui possède un cookie expiré.
const AUTH_PATHS = ['/login', '/register'];

// Pages accessibles sans être connecté (et sans redirection si on l'est).
// Le catalogue produits et le comparateur sont publics.
const OPEN_PATHS = ['/products', '/comparateur'];

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

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)',
  ],
};
