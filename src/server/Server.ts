import config from 'config';

import express, { type Express, type Router } from 'express';
import { type Browser, firefox as device, Page } from 'playwright';

import { RouterCtx, TBrowserArgs } from '../types/twitter-video-downloader';

import helmet from 'helmet';
import morgan from 'morgan';
import { EventEmitter } from 'stream';
import { openTwitter } from '../components/openTwitter';

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
      .then(openTwitter(!preventTwitter))
      .then(() => {
        this.initializeMiddleware();
        this.initializeRoutes(router);
        this.emit('browser_ready');
      });
  }

  private async initializeBrowser(args: TBrowserArgs): Promise<Browser> {
    if (!this.browser) {
      this.browser = await device.launch(args);
      await this.browser.newContext();
    }

    return this.browser;
  }

  private initializeMiddleware() {
    this.app.use(helmet());
    this.app.use(morgan('combined'));
  }

  private async initializeRoutes(router: (ctx: RouterCtx) => Router) {
    this.app.use(router({
      getTwitterPage: this.getTwitterPage.bind(this),
    }));
  }

  private async getBrowser(): Promise<Browser> {
    const browser = this.initializeBrowser(this.browserArgs);
    
    return browser;
  }

  private async getTwitterPage(): Promise<Page> {
    const browser = await this.getBrowser();

    const [context] = await browser.contexts();

    if (!context) throw Error('Browser context does not exist');
    const pages: Array<Page> = context.pages();

    if (pages.length > 0) return pages[0]!;

    throw Error('Could not find any open pages');
  }

  public getExpress(): Express {
    return this.app;
  }
}
