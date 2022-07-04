import type { RequestHandler } from 'express';

const NotFoundMiddleware = (): RequestHandler => (req, res) => {
  res.status(404).json({
    status: '404',
    path: req.originalUrl,
    msg: 'Could not find endpoint.',
  });
};

export default {
  NotFound: NotFoundMiddleware,
};
