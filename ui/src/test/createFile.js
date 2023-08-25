export default (bytes = 128, fileName = 'test.txt', mimeType = 'text/plain') => {
  let isBlob = bytes instanceof Blob;
  return new File(
    isBlob ? bytes : new Blob(new Uint8Array(bytes || 128), { type: mimeType }),
    fileName,
    { type: mimeType }
  );
};