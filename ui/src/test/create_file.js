const create_file = (bytes = 128, file_name = 'test.txt', mime_type = 'text/plain') => {
  const is_blob = bytes instanceof Blob;
  return new File(
    is_blob ? bytes : new Blob(new Uint8Array(bytes || 128), { type: mime_type }),
    file_name,
    { type: mime_type }
  );
};

export default create_file;
