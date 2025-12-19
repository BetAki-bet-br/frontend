import { test, expect } from '@playwright/test';

test.describe('Register Page', () => {
  test('should allow a user to register', async ({ page }) => {
    // Mock the email validation API endpoint
    await page.route('**/api/portal/v1/player/validate', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ status: 'Ok' }]),
      });
    });

    // Mock the Legitimuz API endpoint
    await page.route('**/api/legitimuz/v1/analysis/signup', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          body: {
            fingerprint: 'mock_fingerprint',
          },
        }),
      });
    });

    // Navigate to the registration page
    await page.goto('/auth/register');

    // Fill out the form
    const randomEmail = `test-${Date.now()}@example.com`;
    await page.getByPlaceholder('CPF').fill('12121718885');
    await page.getByPlaceholder('E-mail').fill(randomEmail);
    await page.getByPlaceholder('Telefone').fill('(13) 99155-8421');
    await page.getByPlaceholder('Data de Nascimento').fill('1970-02-05');
    await page.locator('#password').fill('Vini1234spanol@');
    await page.locator('#confirm-password').fill('Vini1234spanol@');
    await page.getByLabel('Declaro que li e aceito os').check();

    // Wait for the button to be enabled
    await expect(page.getByRole('button', { name: 'Criar conta' })).toBeEnabled();

    // Click the register button
    await page.getByRole('button', { name: 'Criar conta' }).click();

    // Wait for navigation to the login page
    await page.waitForURL('**/auth/login');

    // Assert that the URL is the login page
    expect(page.url()).toContain('/auth/login');
  });
});
