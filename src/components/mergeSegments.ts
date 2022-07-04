import { Readable } from 'stream';

export const mergeSegments = (segmentFiles: string[]) => {
  const stream = new Readable();
  stream._read = () => {};

  segmentFiles.forEach(file => {
    stream.push(file);
  });

  stream.push(null);

  return stream;
};
