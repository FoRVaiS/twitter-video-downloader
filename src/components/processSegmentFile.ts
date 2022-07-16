import path from 'path';

import * as handbrake from 'handbrake-js';
import fs from 'fs-extra';

import { consoleLogger, processingLogger } from './loggers';

export const processSegmentFile = (segmentFilepath: string, processedFilepath: string) => new Promise<string>((resolve, reject) => {
  const processedDirectory = path.parse(processedFilepath).dir;

  fs.ensureDirSync(processedDirectory);

  consoleLogger.info('Processing segment file.');
  handbrake.spawn({
    input: segmentFilepath,
    output: processedFilepath,
  })
    .on('progress', ({ percentComplete }) => processingLogger.info(`Processing ${path.parse(processedFilepath).name}: ${Math.floor(percentComplete)}%`))
    .on('complete', () => {
      consoleLogger.info('Processing complete.');
      resolve(processedFilepath);
    })
    .on('error', err => reject(err));
});
