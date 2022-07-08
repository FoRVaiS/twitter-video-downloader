import { Readable } from 'stream';

export const mergeSegments = (segmentFiles: string[]) => {
  const stream = new Readable();
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  stream._read = () => {};

  segmentFiles.forEach(file => {
    stream.push(file);
  });

  stream.push(null);

  return stream;
};
