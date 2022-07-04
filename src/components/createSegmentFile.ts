import type { Readable } from 'stream';

import path from 'path';

import fs from 'fs-extra';
import config from 'config';

const defaultSegmentDirectory = config.get<string>('directories.segments');

export const createSegmentFile = (fileStream: Readable, filename: string) => {
  const videosDirectory = defaultSegmentDirectory || path.join(__dirname, '..', '..', '__videos');
  fs.ensureDirSync(videosDirectory);

  const filepath = path.join(videosDirectory, filename);

  const wStream = fs.createWriteStream(filepath);
  fileStream.pipe(wStream);
  
  return filepath;
};
