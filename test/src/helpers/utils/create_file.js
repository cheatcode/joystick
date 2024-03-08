import { File } from 'node-fetch';

const create_file = (bytes = 128, file_name = 'test.txt', mime_type = 'text/plain') => {
  return new File(
    bytes instanceof Buffer ? bytes : [new Uint8Array(bytes)],
    file_name,
    { type: mime_type }
  );
};

export default create_file;
