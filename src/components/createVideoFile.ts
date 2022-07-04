import path from 'path';

import * as handbrake from 'handbrake-js';
import fs from 'fs-extra';
import config from 'config';

const defaultVideoDirectory = config.get<string>('directories.videos');

export const createVideoFile = (segmentFilepath: string) => new Promise<string>((resolve, reject) => {
  const videoDirectory = defaultVideoDirectory || path.join(__dirname, '..', '..', '__processed');
  fs.ensureDirSync(videoDirectory);

  const videoFilepath = path.join(videoDirectory, `${path.parse(segmentFilepath).name}.mp4`);
  
  handbrake.spawn({
    input: segmentFilepath,
    output: videoFilepath,
  })
    .on('complete', () => resolve(videoFilepath))
    .on('error', err => reject(err));
});
