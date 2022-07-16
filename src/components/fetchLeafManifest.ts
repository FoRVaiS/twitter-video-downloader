import config from 'config';

import { downloadFile } from './downloadFile';
import { parseManifest } from './parseManifest';

import { consoleLogger as logger } from './loggers';

const twitterCdnDomain = config.get<string>('twitter.cdn');

export const fetchLeafManifest = async (rootManifest: ReturnType<typeof parseManifest>) => {
  // Pick the highest resolution manifest
  const leafManifestUrl = rootManifest.playlists.reduce((acc, manifest) => (acc.attributes.BANDWIDTH < manifest.attributes.BANDWIDTH
    ? manifest
    : acc), rootManifest.playlists[0]!);
  logger.info(`Fetching highest quality leaf manifest: ${leafManifestUrl.uri}.`);

  const leafManifestString = await downloadFile(twitterCdnDomain + leafManifestUrl.uri);

  return parseManifest(leafManifestString);
};
