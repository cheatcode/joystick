import { randomBytes } from 'crypto';

const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890';
const characters_length = characters.length;

const generate_id = (length = 16) => {
  const bytes = randomBytes(length * 2); // NOTE: Overshoot to reduce chance of rejections.
  let id = '';
  let i = 0;

  for (let j = 0; i < length && j < bytes.length; j++) {
    const byte = bytes[j];
    // NOTE: Use byte only if it's within a range that avoids modulo bias.
    if (byte < 256 - (256 % characters_length)) {
      id += characters[byte % characters_length];
      i += 1;
    }
  }

  // NOTE: Retry if not enough characters due to rejections.
  return i < length ? generate_id(length) : id;
};

export default generate_id;
