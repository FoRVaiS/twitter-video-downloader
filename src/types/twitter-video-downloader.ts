import type { BrowserContext, chromium as device } from 'playwright';

export type TBrowserArgs = Parameters<typeof device['launch']>[0];

export interface RouterCtx {
  getContext: () => Promise<BrowserContext>
}
