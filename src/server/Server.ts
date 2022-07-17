import config from 'config';

import express, { type Express, type Router } from 'express';
import { type Browser, firefox as device, Page } from 'playwright';

import { RouterCtx, TBrowserArgs } from '../types/twitter-video-downloader';

import helmet from 'helmet';
import morgan from 'morgan';
import { openTwitter } from '../components/openTwitter';

import { accessLogger } from '../components/loggers';

const preventTwitter = config.get<boolean>('debug.preventTwitter');

export class Server {
  private app: Express;
  private browser?: Browser;
  private browserArgs: TBrowserArgs;
  
  constructor(router: (ctx: RouterCtx) => Router, browserArgs?: TBrowserArgs) {
    this.app = express();

    this.browserArgs = browserArgs;

    this.getBrowser()
      .then(async browser => {
        const [context] = browser.contexts();

        if (context) {
          await openTwitter(!preventTwitter)(context);
  
          context.pages().forEach(page => page.close());
        }
      });

    this.initializeMiddleware();
    this.initializeRoutes(router);
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
    this.app.use(morgan('combined', {
      stream: {
        write: msg => accessLogger.info(msg),
      },
    }));
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
    let [page] = context.pages();

    if (!page) page = await context.newPage();

    return page;
  }

  public getExpress(): Express {
    return this.app;
  }
}
