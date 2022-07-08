import path from 'path';

import * as handbrake from 'handbrake-js';
import fs from 'fs-extra';

export const processSegmentFile = (segmentFilepath: string, processedFilepath: string) => new Promise<string>((resolve, reject) => {
  const processedDirectory = path.parse(processedFilepath).dir;

  fs.ensureDirSync(processedDirectory);

  handbrake.spawn({
    input: segmentFilepath,
    output: processedFilepath,
  })
    .on('complete', () => resolve(processedFilepath))
    .on('error', err => reject(err));
});
