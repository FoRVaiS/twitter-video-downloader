import type { Page } from 'playwright';

import config from 'config';

import { interceptManifest } from './interceptManifest';
import { parseManifest } from './parseManifest';

const twitterBaseDomain = config.get<string>('twitter.base');

export const fetchRootManifest = async (page: Page, postPath: string) => {
  const rootManifestString = await interceptManifest(page, twitterBaseDomain + postPath);

  return parseManifest(rootManifestString);
};
