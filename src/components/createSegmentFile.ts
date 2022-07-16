import type { Readable } from 'stream';

import path from 'path';

import fs from 'fs-extra';

import { consoleLogger as logger } from './loggers';

export const createSegmentFile = (fileStream: Readable, segmentFilepath: string) => {
  const segmentDirectory = path.parse(segmentFilepath).dir;

  fs.ensureDirSync(segmentDirectory);

  logger.info('Merging segment files.');
  const wStream = fs.createWriteStream(segmentFilepath);
  fileStream.pipe(wStream);
  
  return segmentFilepath;
};
