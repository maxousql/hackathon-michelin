import { NextResponse } from 'next/server';

export function GET() {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const callbackUrl =
    process.env.STRAVA_CALLBACK_URL ??
    'http://localhost:3000/api/strava/callback';

  const url = new URL('https://www.strava.com/oauth/authorize');
  url.searchParams.set('client_id', clientId!);
  url.searchParams.set('redirect_uri', callbackUrl);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'activity:read');
  url.searchParams.set('approval_prompt', 'auto');

  return NextResponse.redirect(url.toString());
}
