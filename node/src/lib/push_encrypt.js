import crypto from 'crypto';

const ALGORITHM = 'aes-256-ctr';
const IV_LENGTH = 16;

const push_encrypt = (text, key) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export default push_encrypt;
