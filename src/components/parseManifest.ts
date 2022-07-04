import { Parser } from 'm3u8-parser';

export const parseManifest = (manifest: string) => {
  const parser = new Parser();

  parser.addParser({
    expression: /^#EXT-X-MAP/,
    customType: 'header',
    dataParser: (line: string) => {
      const pathStr = line.split('=').pop()!;

      return pathStr.substr(1).substr(0, pathStr.length - 2);
    },
  });
  parser.push(manifest);
  parser.end();

  return parser.manifest;
};
