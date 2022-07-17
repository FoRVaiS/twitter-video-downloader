import type { RequestHandler } from 'express';
import type { RouterCtx } from '../../types/twitter-video-downloader';

import path from 'path';
import config from 'config';

import fs from 'fs-extra';

import { fetchRootManifest } from '../../components/fetchRootManifest';
import { fetchLeafManifest } from '../../components/fetchLeafManifest';
import { downloadSegments } from '../../components/downloadSegments';
import { mergeSegments } from '../../components/mergeSegments';
import { createSegmentFile } from '../../components/createSegmentFile';
import { processSegmentFile } from '../../components/processSegmentFile';

import { consoleLogger as logger } from '../../components/loggers';

const segmentDirectory = config.get<string>('directories.segments');
const processedDirectory = config.get<string>('directories.videos');

const downloadVideoMiddleware = (ctx: RouterCtx): RequestHandler => async (req, res) => {
  const { getContext } = ctx;

  const filename = `@${req.params.username}-${req.params.postId}`;
  const segmentFilepath = segmentDirectory ? path.join(segmentDirectory, `${filename}.m4s`) : path.join(__dirname, '..', '..', '..', '__videos', `${filename}.m4s`);
  const processedFilepath = processedDirectory ? path.join(processedDirectory, `${filename}.mp4`) : path.join(__dirname, '..', '..', '..', '__processed', `${filename}.mp4`);

  if (fs.pathExistsSync(processedFilepath)) {
    logger.warn('Video has already been processed.');
    return res.status(200).download(processedFilepath);
  }

  if (!fs.pathExistsSync(segmentFilepath)) {
    const context = await getContext();
    const page = await context.newPage();
    const rootManifest = await fetchRootManifest(page, req.originalUrl);

    page.close();

    const leafManifest = await fetchLeafManifest(rootManifest);
    const segmentFiles = await downloadSegments(leafManifest);
    const fileStream = mergeSegments(segmentFiles);
    createSegmentFile(fileStream, segmentFilepath);
  } else {
    logger.warn('Segment file already exists, moving onto processing.');
  }

  return processSegmentFile(segmentFilepath, processedFilepath)
    .then(() => res.status(200).download(processedFilepath))
    .catch(e => res.status(500).json({ err: e }));
};

export default {
  downloadVideo: downloadVideoMiddleware,
};
