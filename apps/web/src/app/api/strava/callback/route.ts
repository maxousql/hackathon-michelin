import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');
  const state = req.nextUrl.searchParams.get('state');
  const isMobile = state === 'mobile';

  if (error || !code) {
    if (isMobile) {
      return NextResponse.redirect(
        'michelin-race://strava-callback?error=denied',
      );
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
    if (isMobile) {
      return NextResponse.redirect(
        'michelin-race://strava-callback?error=token_failed',
      );
    }
    return new Response(popupHtml('error', 'Échec échange de code Strava.'), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  // Mode mobile : redirige vers le scheme custom avec le token
  if (isMobile) {
    return NextResponse.redirect(
      `michelin-race://strava-callback?token=${data.access_token}`,
    );
  }

  const cookie = `strava_at=${data.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${data.expires_in}`;

  return new Response(popupHtml('ok', ''), {
    headers: {
      'Content-Type': 'text/html',
      'Set-Cookie': cookie,
    },
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
