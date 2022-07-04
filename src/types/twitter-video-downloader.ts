import type { chromium as device, Page } from 'playwright';

export type TBrowserArgs = Parameters<typeof device['launch']>[0];

export interface RouterCtx {
  getTwitterPage: () => Promise<Page>
}
