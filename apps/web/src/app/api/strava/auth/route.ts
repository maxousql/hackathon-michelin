import { type NextRequest, NextResponse } from 'next/server';

export function GET(req: NextRequest) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const callbackUrl =
    process.env.STRAVA_CALLBACK_URL ??
    'http://localhost:3000/api/strava/callback';

  // ?mobile=1 → state=mobile pour que le callback redirige vers l'app
  const mobile = req.nextUrl.searchParams.get('mobile') === '1';
  const mode = mobile
    ? 'mobile'
    : (req.nextUrl.searchParams.get('mode') ?? 'race');

  const scope =
    mode === 'login' ? 'read,profile:read_all,activity:read' : 'activity:read';

  const url = new URL('https://www.strava.com/oauth/authorize');
  url.searchParams.set('client_id', clientId!);
  url.searchParams.set('redirect_uri', callbackUrl);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', scope);
  url.searchParams.set('approval_prompt', 'auto');
  url.searchParams.set('state', mode);

  return NextResponse.redirect(url.toString());
}
