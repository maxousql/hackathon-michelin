'use server';

import {
  raceAnalyzeRequestSchema,
  raceAnalyzeResponseSchema,
  type RaceAnalyzeRequest,
  type RaceAnalyzeResponse,
} from '@michelin/contracts';

export interface AnalyzeRaceState {
  data: RaceAnalyzeResponse | null;
  error: string | null;
}

export async function analyzeRaceAction(
  request: RaceAnalyzeRequest,
): Promise<AnalyzeRaceState> {
  const parsed = raceAnalyzeRequestSchema.safeParse(request);
  if (!parsed.success) {
    return {
      data: null,
      error: 'Données invalides. Vérifiez les champs du formulaire.',
    };
  }

  const apiBaseUrl =
    process.env['API_INTERNAL_URL'] ?? 'http://localhost:3001/api/v1';

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/race-intelligence/analyze`, {
      body: JSON.stringify(parsed.data),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
  } catch {
    return {
      data: null,
      error:
        "Impossible de contacter l'API. Vérifiez que le serveur est démarré.",
    };
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    return {
      data: null,
      error: `Erreur ${response.status} : ${text || 'Réponse invalide du serveur.'}`,
    };
  }

  const payload: unknown = await response.json();
  const result = raceAnalyzeResponseSchema.safeParse(payload);

  if (!result.success) {
    return { data: null, error: 'Format de réponse inattendu.' };
  }

  return { data: result.data, error: null };
}
