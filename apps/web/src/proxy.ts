import { type NextRequest, NextResponse } from 'next/server';

// Pages d'authentification. La redirection d'un utilisateur déjà connecté est
// faite dans les pages via getCurrentUser(), pas ici, pour ne pas bloquer un
// utilisateur qui possède un cookie expiré.
const AUTH_PATHS = ['/login', '/register'];

// Pages accessibles sans être connecté : la landing (`/`) et le catalogue
// produits (`/products` et ses fiches). Toutes les autres features
// (comparateur, challenge, race-intelligence, reprise, profil, admin…)
// nécessitent une connexion.
const OPEN_PATHS = ['/products'];

function matchesPath(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function proxy(request: NextRequest) {
  // Server Actions are POST requests — never redirect them
  if (request.method !== 'GET') return NextResponse.next();

  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // La landing est toujours publique (match exact pour ne pas tout ouvrir).
  const isLanding = pathname === '/';
  const isAuthPage = AUTH_PATHS.some((p) => matchesPath(pathname, p));
  const isOpen = OPEN_PATHS.some((p) => matchesPath(pathname, p));

  // Non connecté : seules la landing, les pages d'auth et le catalogue
  // sont accessibles. Tout le reste redirige vers la connexion.
  if (!token && !isLanding && !isAuthPage && !isOpen) {
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
