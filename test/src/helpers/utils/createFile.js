import { File } from 'node-fetch';

export default (bytes = 128, fileName = 'test.txt', mimeType = 'text/plain') => {
  return new File(
    bytes instanceof Buffer ? bytes : [new Uint8Array(bytes)],
    fileName,
    { type: mimeType }
  );
};
