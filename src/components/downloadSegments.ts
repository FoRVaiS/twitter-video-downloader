import axios, { type AxiosResponse } from 'axios';
import config from 'config';

import { parseManifest } from './parseManifest';

const twitterCdnDomain = config.get<string>('twitter.cdn');

export const downloadSegments = async (leafManifest: ReturnType<typeof parseManifest>): Promise<Array<string>> => {
  const segmentUrls = [{ uri: leafManifest.custom?.header as string } as typeof leafManifest['segments'][0], ...leafManifest.segments];

  const segmentResponses: Array<AxiosResponse> = await Promise.all(segmentUrls
    .filter(segmentUrl => segmentUrl)
    .map(segment => segment.uri && axios(twitterCdnDomain + segment.uri, {
      responseType: 'arraybuffer',
    }))
    .filter(entry => {
      if (typeof entry === 'string') {
        return false;
      }

      return entry;
    })) as Array<AxiosResponse>;

  const segments = segmentResponses.map<string>(resp => resp.data);

  return segments;
};
