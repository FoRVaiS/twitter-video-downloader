import type { RequestHandler } from 'express';
import type { RouterCtx } from '../../types/twitter-video-downloader';

import { fetchRootManifest } from '../../components/fetchRootManifest';
import { fetchLeafManifest } from '../../components/fetchLeafManifest';
import { downloadSegments } from '../../components/downloadSegments';
import { mergeSegments } from '../../components/mergeSegments';
import { createSegmentFile } from '../../components/createSegmentFile';
import { createVideoFile } from '../../components/createVideoFile';

const downloadVideoMiddleware = (ctx: RouterCtx): RequestHandler => async (req, res) => {
  const { getTwitterPage } = ctx;

  const page = await getTwitterPage();
  const rootManifest = await fetchRootManifest(page, req.originalUrl);
  const leafManifest = await fetchLeafManifest(rootManifest);
  const segmentFiles = await downloadSegments(leafManifest);
  const fileStream = mergeSegments(segmentFiles);
  const segmentFilepath = createSegmentFile(fileStream, `@${req.params.username}-${req.params.postId}.m4s`);

  try {
    const videoFilepath = await createVideoFile(segmentFilepath);

    res.status(200).download(videoFilepath);
  } catch (e) {
    res.status(500).json({ err: e });
  }
};

export default {
  downloadVideo: downloadVideoMiddleware,
};
