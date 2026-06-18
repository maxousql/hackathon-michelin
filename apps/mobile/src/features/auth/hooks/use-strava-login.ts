import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';

import { toast } from '../../../utils/toast';
import { useAuth } from '../context/auth-context';

const STRAVA_CLIENT_ID = '258523';
const STRAVA_CLIENT_SECRET = '8d7c6659b7cdcced2de8d4c0c7a39bec202adec4';
const STRAVA_REDIRECT_URI = 'michelin-race://localhost';

export function useStravaLogin() {
  const { loginWithStrava } = useAuth();
  const [loading, setLoading] = useState(false);

  async function connect() {
    setLoading(true);
    try {
      const authUrl =
        `https://www.strava.com/oauth/authorize` +
        `?client_id=${STRAVA_CLIENT_ID}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(STRAVA_REDIRECT_URI)}` +
        `&scope=activity:read` +
        `&approval_prompt=auto`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'michelin-race://',
      );
      if (result.type !== 'success') return;

      const code = new URL(result.url).searchParams.get('code');
      if (!code) {
        toast.error('Code Strava non reçu.');
        return;
      }

      const tokenRes = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenRes.ok) {
        toast.error('Échange de token Strava échoué.');
        return;
      }

      const { access_token } = (await tokenRes.json()) as {
        access_token: string;
      };
      await loginWithStrava(access_token);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Connexion Strava échouée.');
    } finally {
      setLoading(false);
    }
  }

  return { connect, loading };
}
