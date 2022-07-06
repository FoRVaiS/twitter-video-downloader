import config from 'config';
import type { BrowserContext } from 'playwright';

import { loginTwitter } from './loginTwitter';

const twitterBaseDomain = config.get<string>('twitter.base');
const twitterLoginPath = config.get<string>('twitter.login');
const twitterAccount = config.get<{ username: string, password: string }>('twitter.account');

export const openTwitter = (shouldOpenTwitter: boolean) => async (browserContext: BrowserContext): Promise<void> => {
  if (!shouldOpenTwitter) return Promise.resolve();
  
  const page = await browserContext.newPage();
  await page.goto(twitterBaseDomain + twitterLoginPath);

  // !TODO: Handle errors whenever username or password is empty
  return loginTwitter(page, twitterAccount.username, twitterAccount.password);
};
