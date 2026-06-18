import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  athlete?: {
    id: number;
    firstname: string;
    lastname: string;
    profile_medium: string;
    city: string;
    country: string;
    bikes: Array<{
      id: string;
      name: string;
      distance: number;
      primary: boolean;
    }>;
  };
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');
  const mode = req.nextUrl.searchParams.get('state') ?? 'race';
  const origin = new URL(req.url).origin;

  if (error || !code) {
    if (mode === 'login') {
      return NextResponse.redirect(`${origin}/login?error=strava`);
    }
    return new Response(popupHtml('error', 'Connexion Strava refusée.'), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    if (mode === 'login') {
      return NextResponse.redirect(`${origin}/login?error=strava`);
    }
    return new Response(popupHtml('error', 'Échec échange de code Strava.'), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const data = (await res.json()) as TokenResponse;

  if (mode === 'login') {
    const athlete = data.athlete;
    const profile = athlete
      ? {
          id: athlete.id,
          firstName: athlete.firstname,
          lastName: athlete.lastname,
          photo: athlete.profile_medium,
          city: athlete.city ?? '',
          country: athlete.country ?? '',
          bikes: athlete.bikes ?? [],
        }
      : null;

    const response = NextResponse.redirect(`${origin}/profil`);
    response.cookies.set('strava_at', data.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: data.expires_in,
    });
    if (profile) {
      response.cookies.set(
        'strava_profile',
        encodeURIComponent(JSON.stringify(profile)),
        { httpOnly: true, sameSite: 'lax', path: '/', maxAge: data.expires_in },
      );
    }

    try {
      const apiUrl =
        process.env.API_INTERNAL_URL ?? 'http://localhost:3001/api/v1';
      const michelinRes = await fetch(`${apiUrl}/auth/strava`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stravaToken: data.access_token }),
      });
      if (michelinRes.ok) {
        const { accessToken } = (await michelinRes.json()) as {
          accessToken: string;
        };
        response.cookies.set('auth_token', accessToken, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });
      }
    } catch {
      // Michelin account creation failure is non-blocking
    }

    return response;
  }

  const cookie = `strava_at=${data.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${data.expires_in}`;
  return new Response(popupHtml('ok', ''), {
    headers: { 'Content-Type': 'text/html', 'Set-Cookie': cookie },
  });
}

function popupHtml(status: 'ok' | 'error', message: string) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f5f5f5">
<p style="font-size:16px">${status === 'ok' ? '✅ Connexion réussie, fermeture…' : `❌ ${message}`}</p>
<script>
  if(window.opener){
    window.opener.postMessage({type:'strava_connected',status:'${status}'},'*');
  }
  setTimeout(()=>window.close(), 800);
</script>
</body></html>`;
}
