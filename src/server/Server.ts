import { EventEmitter } from 'stream';

import config from 'config';

import express, { type Express, type Router } from 'express';
import { type Browser, type BrowserContext, firefox as device } from 'playwright';

import { RouterCtx, TBrowserArgs } from '../types/twitter-video-downloader';

import helmet from 'helmet';
import morgan from 'morgan';
import { openTwitter } from '../components/openTwitter';

import { accessLogger, consoleLogger } from '../components/loggers';

const preventTwitter = config.get<boolean>('debug.preventTwitter');

export class Server extends EventEmitter {
  private app: Express;
  private browser?: Browser;
  private browserArgs: TBrowserArgs;
  
  constructor(router: (ctx: RouterCtx) => Router, browserArgs?: TBrowserArgs) {
    super();

    this.app = express();

    this.browserArgs = browserArgs;

    this.getBrowser()
      .then(async browser => {
        const context = await browser.newContext();

        consoleLogger.info('Logging into Twitter.');
        await openTwitter(!preventTwitter)(context);
        consoleLogger.info('Login successful.');

        await context.storageState({ path: 'state.json' });
        await context.close();

        this.emit('browser_ready');
      });

    this.initializeMiddleware();
    this.initializeRoutes(router);
  }

  private async initializeBrowser(args: TBrowserArgs): Promise<Browser> {
    if (!this.browser) this.browser = await device.launch(args);

    return this.browser;
  }

  private initializeMiddleware() {
    this.app.use(helmet());
    this.app.use(morgan('combined', {
      stream: {
        write: msg => accessLogger.info(msg),
      },
    }));
  }

  private async initializeRoutes(router: (ctx: RouterCtx) => Router) {
    this.app.use(router({
      getBrowser: this.getBrowser.bind(this),
    }));
  }

  private async getBrowser(): Promise<Browser> {
    const browser = this.initializeBrowser(this.browserArgs);
    
    return browser;
  }

  public getExpress(): Express {
    return this.app;
  }
}
