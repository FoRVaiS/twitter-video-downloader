import type { Readable } from 'stream';

import path from 'path';

import fs from 'fs-extra';

export const createSegmentFile = (fileStream: Readable, segmentFilepath: string) => {
  const segmentDirectory = path.parse(segmentFilepath).dir;

  fs.ensureDirSync(segmentDirectory);

  const wStream = fs.createWriteStream(segmentFilepath);
  fileStream.pipe(wStream);
  
  return segmentFilepath;
};