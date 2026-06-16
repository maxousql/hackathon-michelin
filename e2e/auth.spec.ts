import { expect, test } from '@playwright/test';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function clearAuth(page: import('@playwright/test').Page) {
  await page.context().clearCookies();
}

// Shorthand locators with exact matching to avoid ambiguity between
// "Mot de passe" and "Confirmer le mot de passe", "Nom" and "Prénom", etc.
function password(page: import('@playwright/test').Page) {
  return page.getByLabel('Mot de passe', { exact: true });
}
function confirmPassword(page: import('@playwright/test').Page) {
  return page.getByLabel('Confirmer le mot de passe', { exact: true });
}

// ── Login page ────────────────────────────────────────────────────────────────

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await page.goto('/login');
  });

  test('renders the form fields', async ({ page }) => {
    await expect(page.getByLabel('Adresse email')).toBeVisible();
    await expect(password(page)).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Se connecter' }),
    ).toBeVisible();
  });

  test('has a link to the register page', async ({ page }) => {
    await page.getByRole('link', { name: 'Créer un compte' }).click();
    await expect(page).toHaveURL('/register');
  });
});

// ── Register page ─────────────────────────────────────────────────────────────

test.describe('Register page', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await page.goto('/register');
  });

  test('renders all form fields', async ({ page }) => {
    await expect(page.getByLabel('Prénom')).toBeVisible();
    await expect(page.getByLabel('Nom', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Adresse email')).toBeVisible();
    await expect(password(page)).toBeVisible();
    await expect(confirmPassword(page)).toBeVisible();
  });

  test('shows password rules checklist when typing', async ({ page }) => {
    await password(page).fill('ab');
    await expect(page.locator('.password-rules')).toBeVisible();
    await expect(page.locator('.password-rules li')).toHaveCount(3);
  });

  test('all rules turn green with a strong password', async ({ page }) => {
    await password(page).fill('Password1!');
    const rules = page.locator('.password-rules li');
    for (const rule of await rules.all()) {
      await expect(rule).toHaveClass(/valid/);
    }
  });

  test('shows error when passwords do not match', async ({ page }) => {
    await password(page).fill('Password1!');
    await confirmPassword(page).fill('Password2!');
    await expect(
      page.getByText('Les mots de passe ne correspondent pas.'),
    ).toBeVisible();
  });

  test('shows success when passwords match', async ({ page }) => {
    await password(page).fill('Password1!');
    await confirmPassword(page).fill('Password1!');
    await expect(
      page.getByText('Les mots de passe correspondent.'),
    ).toBeVisible();
  });

  test('submit button is disabled when passwords do not match', async ({
    page,
  }) => {
    await password(page).fill('Password1!');
    await confirmPassword(page).fill('Mismatch1!');
    await expect(
      page.getByRole('button', { name: 'Créer mon compte' }),
    ).toBeDisabled();
  });

  test('submit button is enabled when passwords match', async ({ page }) => {
    await password(page).fill('Password1!');
    await confirmPassword(page).fill('Password1!');
    await expect(
      page.getByRole('button', { name: 'Créer mon compte' }),
    ).toBeEnabled();
  });

  test('has a link back to the login page', async ({ page }) => {
    await page.getByRole('link', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('/login');
  });
});

// ── Protected routes ──────────────────────────────────────────────────────────

test.describe('Protected routes', () => {
  test('redirects unauthenticated user from / to /login', async ({ page }) => {
    await clearAuth(page);
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });
});

// ── Full-stack tests (require pnpm dev + API running) ─────────────────────────
// Set TEST_USER_EMAIL and TEST_USER_PASSWORD to enable.

const hasTestUser =
  !!process.env.TEST_USER_EMAIL && !!process.env.TEST_USER_PASSWORD;

test.describe('Full-stack auth flow', () => {
  test.skip(
    !hasTestUser,
    'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run these tests.',
  );

  const email = process.env.TEST_USER_EMAIL ?? '';
  const password_ = process.env.TEST_USER_PASSWORD ?? '';

  test('successful login redirects to home', async ({ page }) => {
    await clearAuth(page);
    await page.goto('/login');
    await page.getByLabel('Adresse email').fill(email);
    await password(page).fill(password_);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('/');
  });

  test('wrong password shows an error message', async ({ page }) => {
    await clearAuth(page);
    await page.goto('/login');
    await page.getByLabel('Adresse email').fill(email);
    await password(page).fill('WrongPassword1!');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page.locator('.form-error')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('logout redirects back to /login', async ({ page }) => {
    await clearAuth(page);
    await page.goto('/login');
    await page.getByLabel('Adresse email').fill(email);
    await password(page).fill(password_);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('/');

    await page.getByRole('button', { name: 'Se déconnecter' }).click();
    await expect(page).toHaveURL('/login');
  });

  test('authenticated user is redirected away from /login', async ({
    page,
  }) => {
    await clearAuth(page);
    await page.goto('/login');
    await page.getByLabel('Adresse email').fill(email);
    await password(page).fill(password_);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('/');

    await page.goto('/login');
    await expect(page).toHaveURL('/');
  });
});
