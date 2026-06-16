// Exécuté avant chaque fichier de test (vitest setupFiles).
// La validation d'environnement (ConfigModule.forRoot) exige les clés Supabase
// dès l'import d'AppModule ; on fournit des valeurs factices pour les tests qui
// démarrent l'application. Aucune connexion Supabase réelle n'est faite.
process.env.NODE_ENV ??= 'test';
process.env.SUPABASE_URL ??= 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'test-service-role-key';
process.env.SUPABASE_JWT_SECRET ??= 'test-jwt-secret';
