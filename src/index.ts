import httpServer from 'http';

import config from 'config';

import { Server } from './server/Server';
import { getRoutes } from './server/routes/api';

import { consoleLogger as logger } from './components/loggers';

const expressServer = new Server(getRoutes, { headless: process.env.NODE_ENV !== 'development' });

const server = httpServer.createServer(expressServer.getExpress());

const port = config.get<number>('server.port');
const address = config.get<string>('server.address');

expressServer.on('browser_ready', () => {
  server.listen(port, address, () => {
    logger.info(`Listening on ${address}:${port}.`);
  });
});
