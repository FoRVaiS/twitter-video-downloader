import httpServer from 'http';

import config from 'config';

import { Server } from './server/Server';
import { getRoutes } from './server/routes/api';

const expressServer = new Server(getRoutes, { headless: process.env.NODE_ENV !== 'development' });

expressServer.on('browser_ready', () => {
  const server = httpServer.createServer(expressServer.getExpress());

  const port = config.get<number>('server.port');
  const address = config.get<string>('server.address');

  server.listen(port, address, () => {
    console.log(`Listening on ${address}:${port}`);
  });
});
