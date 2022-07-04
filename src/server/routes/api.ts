import { type RouterCtx } from '../../types/twitter-video-downloader';

import { Router } from 'express';
import config from 'config';

import twitterController from '../controllers/twitter.controller';
import statusController from '../controllers/status.controller';

const twitterPost = config.get<string>('twitter.post');

export const getRoutes = (ctx: RouterCtx): Router => {
  const router = Router();
  
  router.get(twitterPost, twitterController.downloadVideo(ctx));
  router.get('*', statusController.NotFound());

  return router;
};
