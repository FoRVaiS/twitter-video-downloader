import { type Page } from 'playwright';

export const loginTwitter = async (page: Page, username: string, password: string) => {
  if (username.length === 0 || password.length === 0) return Promise.reject(new Error('Username or password were empty'));

  await page.waitForLoadState('networkidle');
  await page.fill('input[name="text"]', username);
  await page.click('text=Next');
  await page.fill('input[name="password"]', password);
  await page.click('text=Log in');

  return Promise.resolve();
};
