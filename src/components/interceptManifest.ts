import { type Page } from 'playwright';
import { downloadFile } from './downloadFile';

const branchManifestLink = /\.m3u8/g;
// const branchManifestLink = /.+\/ext_tw_video\/(?<postid>\d+)\/pu\/pl\/(?<manifest>[\w|-]+.m3u8)/;

export const interceptManifest = async (page: Page, url: string) => new Promise<string>(resolve => {
  page.route(branchManifestLink, async route => {
    const requestUrl = route.request().url();

    resolve(await downloadFile(requestUrl));

    page.unroute(branchManifestLink);

    return route.continue();
  })
    .then(() => page.goto(url));
});
