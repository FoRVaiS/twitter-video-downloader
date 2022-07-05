import config from 'config';
import type { Browser } from 'playwright';

import { loginTwitter } from './loginTwitter';

const twitterBaseDomain = config.get<string>('twitter.base');
const twitterLoginPath = config.get<string>('twitter.login');
const twitterAccount = config.get<{ username: string, password: string }>('twitter.account');

export const openTwitter = (shouldOpenTwitter: boolean) => async (browser: Browser): Promise<void> => {
  if (!shouldOpenTwitter) return Promise.resolve();
  
  const page = await browser.newPage();
  await page.goto(twitterBaseDomain + twitterLoginPath);

  // !TODO: Handle errors whenever username or password is empty
  return loginTwitter(page, twitterAccount.username, twitterAccount.password);
};
